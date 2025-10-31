import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  // Initialize OpenAI client lazily
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const { feedbackId } = await request.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Get feedback record
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('id', feedbackId)
    .single();
  
  if (error || !feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }
  
  // Update status
  await supabase
    .from('feedback')
    .update({ status: 'transcribing' })
    .eq('id', feedbackId);
  
  try {
    // Download audio file
    const audioResponse = await fetch(feedback.audio_url);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
    
    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json'
    });
    
    // Clean and analyze with GPT
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are analyzing user feedback. Extract: 1) cleanedTranscript (remove filler words like um, uh, like), 2) sentiment (positive/neutral/negative), 3) themes (array of 2-3 key topics mentioned), 4) insights (one actionable sentence). Return JSON only with these exact keys: cleanedTranscript, sentiment, themes, insights.'
      }, {
        role: 'user',
        content: `Transcript: "${transcription.text}"`
      }],
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(analysis.choices[0].message.content || '{}');
    
    // Update feedback record
    await supabase
      .from('feedback')
      .update({
        transcript: transcription.text,
        cleaned_transcript: result.cleanedTranscript,
        sentiment: result.sentiment,
        themes: result.themes,
        insights: result.insights,
        status: 'completed'
      })
      .eq('id', feedbackId);
    
    // AI Ticket Consolidation (only for B2B SaaS widget)
    const { data: client } = await supabase
      .from('clients')
      .select('feedback_widget_style')
      .eq('id', feedback.client_id)
      .single();
    
    if (client?.feedback_widget_style === 'b2b-saas') {
      try {
        // Check if this IP already submitted similar feedback recently (within 7 days)
        const { data: recentFeedbackFromIP } = await supabase
          .from('feedback')
          .select('ticket_id, cleaned_transcript')
          .eq('client_id', feedback.client_id)
          .eq('ip_address', feedback.ip_address)
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .limit(10);
        
        // Get all open tickets for this client
        const { data: existingTickets } = await supabase
          .from('tickets')
          .select('id, title, description')
          .eq('client_id', feedback.client_id)
          .neq('status', 'shipped');
        
        // Build context with IP history
        const ipHistoryContext = recentFeedbackFromIP && recentFeedbackFromIP.length > 0
          ? `\n\nNOTE: This same user (IP) recently submitted:\n${recentFeedbackFromIP.map(f => `- "${f.cleaned_transcript}" ${f.ticket_id ? '(already linked to ticket)' : ''}`).join('\n')}`
          : '\n\n(This is the first feedback from this user)';
        
        // Use GPT to determine if feedback matches existing ticket or needs new one
        const ticketDecision = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a product manager analyzing user feedback for ticket consolidation. Be AGGRESSIVE in matching similar requests. If the same user already submitted similar feedback, link to that ticket. Determine if this feedback matches an existing ticket or needs a new one. Return JSON with: matchingTicketId (UUID or null), newTicketTitle (if creating new), newTicketDescription (if creating new), suggestedPriority (low/medium/high based on urgency and impact).'
          }, {
            role: 'user',
            content: `Feedback: "${result.cleanedTranscript}"${ipHistoryContext}\n\nExisting Tickets:\n${(existingTickets || []).map(t => `ID: ${t.id}\nTitle: ${t.title}\nDescription: ${t.description}`).join('\n\n')}`
          }],
          response_format: { type: 'json_object' }
        });
        
        const decision = JSON.parse(ticketDecision.choices[0].message.content || '{}');
        
        if (decision.matchingTicketId && existingTickets?.some(t => t.id === decision.matchingTicketId)) {
          // Link to existing ticket and increment count
          await supabase
            .from('feedback')
            .update({ ticket_id: decision.matchingTicketId })
            .eq('id', feedbackId);
          
          await supabase.rpc('increment_ticket_count', { ticket_id: decision.matchingTicketId });
        } else if (decision.newTicketTitle) {
          // Create new ticket
          const { data: newTicket } = await supabase
            .from('tickets')
            .insert({
              client_id: feedback.client_id,
              title: decision.newTicketTitle,
              description: decision.newTicketDescription || result.cleanedTranscript,
              status: 'new',
              ai_suggested_priority: decision.suggestedPriority,
              feedback_count: 1
            })
            .select()
            .single();
          
          if (newTicket) {
            await supabase
              .from('feedback')
              .update({ ticket_id: newTicket.id })
              .eq('id', feedbackId);
          }
        }
      } catch (ticketError) {
        console.error('Ticket consolidation error:', ticketError);
        // Don't fail the whole request if ticket logic fails
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Transcription error:', error);
    await supabase
      .from('feedback')
      .update({ status: 'failed' })
      .eq('id', feedbackId);
    
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}

