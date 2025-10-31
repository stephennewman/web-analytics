import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

// Manual ticket creation from feedback (for retroactive processing)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { feedbackId } = await request.json();

  if (!feedbackId) {
    return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Get feedback record
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('id', feedbackId)
    .single();

  if (error || !feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }

  if (!feedback.cleaned_transcript) {
    return NextResponse.json({ error: 'Feedback not yet transcribed' }, { status: 400 });
  }

  if (feedback.ticket_id) {
    return NextResponse.json({ error: 'Feedback already has a ticket', ticketId: feedback.ticket_id }, { status: 400 });
  }

  try {
    // Get all open tickets for this client
    const { data: existingTickets } = await supabase
      .from('tickets')
      .select('id, title, description')
      .eq('client_id', feedback.client_id)
      .neq('status', 'shipped');

    // Use GPT to determine if feedback matches existing ticket or needs new one
    const ticketDecision = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are a product manager analyzing user feedback for ticket consolidation. Be AGGRESSIVE in matching similar requests. Determine if this feedback matches an existing ticket or needs a new one. Return JSON with: matchingTicketId (UUID or null), newTicketTitle (if creating new), newTicketDescription (if creating new), suggestedPriority (low/medium/high based on urgency and impact).'
      }, {
        role: 'user',
        content: `Feedback: "${feedback.cleaned_transcript}"\n\nExisting Tickets:\n${(existingTickets || []).map(t => `ID: ${t.id}\nTitle: ${t.title}\nDescription: ${t.description}`).join('\n\n')}`
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

      // Rescore ticket with new feedback (async)
      fetch(`${request.nextUrl.origin}/api/tickets/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: decision.matchingTicketId })
      }).catch(err => console.error('Auto-rescoring failed:', err));

      return NextResponse.json({ 
        success: true, 
        action: 'linked', 
        ticketId: decision.matchingTicketId 
      });
    } else if (decision.newTicketTitle) {
      // Create new ticket
      const { data: newTicket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          client_id: feedback.client_id,
          title: decision.newTicketTitle,
          description: decision.newTicketDescription || feedback.cleaned_transcript,
          status: 'new',
          ai_suggested_priority: decision.suggestedPriority,
          feedback_count: 1
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
        return NextResponse.json({ error: 'Failed to create ticket', details: ticketError }, { status: 500 });
      }

      if (newTicket) {
        await supabase
          .from('feedback')
          .update({ ticket_id: newTicket.id })
          .eq('id', feedbackId);

        // Trigger AI scoring (async, don't wait)
        fetch(`${request.nextUrl.origin}/api/tickets/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId: newTicket.id })
        }).catch(err => console.error('Auto-scoring failed:', err));

        return NextResponse.json({ 
          success: true, 
          action: 'created', 
          ticketId: newTicket.id,
          ticket: newTicket
        });
      }
    }

    return NextResponse.json({ error: 'Could not process feedback into ticket' }, { status: 500 });

  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

