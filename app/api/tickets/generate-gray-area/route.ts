import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clientId } = await request.json();

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Get all feedback with transcripts for this client
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('id, cleaned_transcript, themes, insights, sentiment')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .not('cleaned_transcript', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (feedbackError || !feedback || feedback.length === 0) {
      return NextResponse.json({ 
        error: 'No feedback available to analyze',
        generated: 0,
        tickets: []
      });
    }

    // Get existing tickets to avoid duplicates
    const { data: existingTickets } = await supabase
      .from('tickets')
      .select('id, title, description')
      .eq('client_id', clientId);

    // Prepare context for AI
    const feedbackContext = feedback.map((f, i) => 
      `[${i+1}] (ID: ${f.id}) "${f.cleaned_transcript}" (Sentiment: ${f.sentiment})`
    ).join('\n');

    const existingTicketsContext = (existingTickets || []).map(t => 
      `- ${t.title}: ${t.description || 'No description'}`
    ).join('\n');

    // AI Generation Prompt
    const generationPrompt = `You are a product strategist analyzing voice feedback to discover UNSTATED needs and opportunities.

VOICE FEEDBACK (${feedback.length} entries):
${feedbackContext}

EXISTING TICKETS (to avoid duplicates):
${existingTicketsContext}

YOUR TASK:
Analyze the feedback to identify GRAY AREA opportunities - problems users are experiencing but not directly stating.

Look for:
1. Patterns across multiple feedback entries
2. Friction points they mention but don't propose solutions for
3. Workarounds they describe (indicates missing features)
4. Adjacent problems that would enhance the core request
5. Deeper needs beneath surface-level requests

Generate 3-5 NEW ticket ideas that:
- Address unstated needs (read between the lines)
- Are grounded in actual feedback (not speculative)
- Don't duplicate existing tickets
- Would meaningfully improve the product
- Are specific and actionable

For each ticket, return:
{
  "title": "Clear, specific feature name",
  "description": "Detailed description of what and why (2-3 sentences)",
  "reasoning": "Explain the gap between what users said vs. what they need",
  "source_feedback_ids": ["id1", "id2"],
  "confidence": 0.75 (0-1, how confident you are this is a real need),
  "estimated_effort_hours": 40,
  "ai_suggested_priority": "high"
}

Return JSON with single key "tickets" containing array of 3-5 tickets.
IMPORTANT: Only suggest tickets with confidence >= 0.70`;

    const generationResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are an expert product strategist who excels at identifying unstated customer needs from feedback. You read between the lines to discover opportunities others miss.'
      }, {
        role: 'user',
        content: generationPrompt
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7 // Slightly creative but grounded
    });

    const result = JSON.parse(generationResponse.choices[0].message.content || '{"tickets":[]}');
    const generatedTickets = result.tickets || [];

    if (generatedTickets.length === 0) {
      return NextResponse.json({ 
        generated: 0,
        tickets: [],
        message: 'No gray area opportunities found'
      });
    }

    // Create tickets in database with ai_generated flag
    const ticketsToInsert = generatedTickets.map((ticket: any) => ({
      client_id: clientId,
      title: ticket.title,
      description: ticket.description,
      status: 'new',
      ai_generated: true,
      ai_suggested_priority: ticket.ai_suggested_priority || 'medium',
      feedback_count: ticket.source_feedback_ids?.length || 0,
      generation_source: {
        feedback_ids: ticket.source_feedback_ids || [],
        reasoning: ticket.reasoning,
        confidence: ticket.confidence || 0.7,
        generated_at: new Date().toISOString()
      },
      scores: {
        demand: 0,
        differentiation: 0,
        value: 0,
        implementation: 0,
        strategic_fit: 0,
        virality: 0,
        implied_need: 10, // High by definition (gray area)
        enterprise_blocker: false,
        effort_hours: ticket.estimated_effort_hours || null,
        quick_win_score: 0,
        traditional_score: 0,
        differentiation_score: 0,
        gray_area_score: ticket.confidence * 10, // Use confidence as gray area score
        enterprise_score: 0,
        viral_score: 0,
        last_scored_at: null,
        ai_insight: ticket.reasoning
      }
    }));

    const { data: createdTickets, error: insertError } = await supabase
      .from('tickets')
      .insert(ticketsToInsert)
      .select();

    if (insertError) {
      console.error('Error creating gray area tickets:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create tickets',
        details: insertError 
      }, { status: 500 });
    }

    // Auto-score the newly created tickets (async)
    (createdTickets || []).forEach(ticket => {
      fetch(`${request.nextUrl.origin}/api/tickets/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id })
      }).catch(err => console.error('Auto-scoring gray area ticket failed:', err));
    });

    return NextResponse.json({ 
      success: true,
      generated: createdTickets?.length || 0,
      tickets: createdTickets,
      message: `Generated ${createdTickets?.length} gray area tickets`
    });

  } catch (error) {
    console.error('Gray area generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate gray area tickets',
      details: String(error)
    }, { status: 500 });
  }
}

