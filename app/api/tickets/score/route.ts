import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ticketId } = await request.json();

  if (!ticketId) {
    return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Get ticket with all feedback
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        feedback:feedback(
          cleaned_transcript,
          sentiment,
          themes,
          insights,
          created_at
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Prepare context for AI
    const feedbackContext = (ticket.feedback || [])
      .map((f: any) => `"${f.cleaned_transcript}" (${f.sentiment}, ${new Date(f.created_at).toLocaleDateString()})`)
      .join('\n');

    // AI Scoring using GPT-4o-mini
    const scoringPrompt = `You are a product manager analyzing a feature request ticket. Score it across multiple dimensions.

TICKET:
Title: ${ticket.title}
Description: ${ticket.description}
Feedback Count: ${ticket.feedback_count}
Voice Feedback:
${feedbackContext || 'No voice feedback yet'}

Score each dimension from 1-10:

1. DEMAND (1-10): Based on feedback count, recency, user urgency
   - Consider: How many people want this? How recent are requests? How urgent?

2. DIFFERENTIATION (1-10): How unique/competitive advantage is this?
   - 10 = Nobody else has this, creates moat
   - 5 = Nice differentiator
   - 1 = Table stakes, everyone has it

3. VALUE (1-10): Impact on users (quality × efficiency × reach)
   - Quality: How well does it solve the problem?
   - Efficiency: Time/money saved?
   - Reach: How many users benefit?

4. IMPLEMENTATION (1-10): Ease of building (INVERSE of complexity)
   - 10 = 1 day or less
   - 7 = 1 week
   - 5 = 1 month
   - 1 = 3+ months, major refactor

5. STRATEGIC_FIT (1-10): Alignment with business vision
   - Does it unlock new customer segments?
   - Does it support core value prop?
   - Does it create platform effects?

6. VIRALITY (1-10): Does it encourage sharing/invites?
   - Does it create shareable moments?
   - Network effects?
   - Word-of-mouth potential?

7. IMPLIED_NEED (1-10): Unstated problems in feedback
   - Read between the lines
   - What friction do they NOT mention?
   - What workarounds suggest deeper issues?

8. ENTERPRISE_BLOCKER (true/false): Is this required for enterprise customers?
   - SSO, compliance, security, audit logs, permissions, etc.

9. EFFORT_HOURS (number): Realistic development time estimate in hours

10. AI_INSIGHT (string): 1-2 sentence explanation of why this matters and key considerations

Return JSON with these exact keys: demand, differentiation, value, implementation, strategic_fit, virality, implied_need, enterprise_blocker, effort_hours, ai_insight`;

    const scoringResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are an expert product manager with deep experience in prioritization frameworks, user research, and strategic planning.'
      }, {
        role: 'user',
        content: scoringPrompt
      }],
      response_format: { type: 'json_object' }
    });

    const rawScores = JSON.parse(scoringResponse.choices[0].message.content || '{}');

    // Calculate framework scores
    const demand = rawScores.demand || 5;
    const differentiation = rawScores.differentiation || 5;
    const value = rawScores.value || 5;
    const implementation = rawScores.implementation || 5;
    const strategic_fit = rawScores.strategic_fit || 5;
    const virality = rawScores.virality || 5;
    const implied_need = rawScores.implied_need || 5;

    // Framework formulas
    const traditional_score = (demand * 0.4) + (value * 0.3) + (implementation * 0.2) + (strategic_fit * 0.1);
    const differentiation_score = (differentiation * 0.5) + (value * 0.3) + (strategic_fit * 0.2);
    const gray_area_score = (implied_need * 0.4) + (strategic_fit * 0.3) + (differentiation * 0.2) + (value * 0.1);
    const quick_win_score = value * implementation / (11 - implementation) * Math.sqrt(demand);
    const enterprise_score = (strategic_fit * 0.4) + ((rawScores.enterprise_blocker ? 10 : 0) * 0.3) + (value * 0.2) + (demand * 0.1);
    const viral_score = (virality * 0.4) + (value * 0.3) + (implementation * 0.2) + (differentiation * 0.1);

    const scores = {
      demand,
      differentiation,
      value,
      implementation,
      strategic_fit,
      virality,
      implied_need,
      enterprise_blocker: rawScores.enterprise_blocker || false,
      effort_hours: rawScores.effort_hours || null,
      quick_win_score: Math.round(quick_win_score * 10) / 10,
      traditional_score: Math.round(traditional_score * 10) / 10,
      differentiation_score: Math.round(differentiation_score * 10) / 10,
      gray_area_score: Math.round(gray_area_score * 10) / 10,
      enterprise_score: Math.round(enterprise_score * 10) / 10,
      viral_score: Math.round(viral_score * 10) / 10,
      last_scored_at: new Date().toISOString(),
      ai_insight: rawScores.ai_insight || 'No insight provided'
    };

    // Update ticket with scores
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ scores })
      .eq('id', ticketId);

    if (updateError) {
      console.error('Error updating ticket scores:', updateError);
      return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      scores,
      message: 'Ticket scored successfully'
    });

  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json({ 
      error: 'Failed to score ticket', 
      details: String(error) 
    }, { status: 500 });
  }
}

// Batch scoring endpoint
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clientId } = await request.json();

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    // Get all tickets for this client that need scoring
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id')
      .eq('client_id', clientId);

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ message: 'No tickets to score' });
    }

    // Score each ticket (async)
    const scoringPromises = tickets.map(ticket => 
      fetch(`${request.nextUrl.origin}/api/tickets/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id })
      }).catch(err => console.error('Batch scoring error:', err))
    );

    await Promise.all(scoringPromises);

    return NextResponse.json({ 
      success: true,
      scored: tickets.length,
      message: `Scored ${tickets.length} tickets`
    });

  } catch (error) {
    console.error('Batch scoring error:', error);
    return NextResponse.json({ 
      error: 'Failed to batch score', 
      details: String(error) 
    }, { status: 500 });
  }
}

