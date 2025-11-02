import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { clientId, sessionId, type, content, url, timestamp } = await request.json();

    if (!clientId || !sessionId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert text feedback into database
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        client_id: clientId,
        session_id: sessionId,
        url: url,
        audio_url: '', // Empty string for text feedback (column has NOT NULL constraint)
        transcript: content, // Store text as transcript
        cleaned_transcript: content,
        duration: 0, // No audio duration
        status: 'completed', // Text is already "processed"
        created_at: timestamp
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Error inserting text feedback:', feedbackError);
      console.error('Feedback error details:', JSON.stringify(feedbackError));
      return NextResponse.json(
        { error: 'Failed to save feedback', details: feedbackError.message },
        { status: 500 }
      );
    }

    // Create feedback event in events table
    await supabase.from('events').insert({
      client_id: clientId,
      session_id: sessionId,
      event: 'feedback_submitted',
      url: url,
      data: { type: 'text', content: content.substring(0, 100) },
      timestamp: timestamp
    });

    // Optional: Run sentiment analysis on text feedback
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai').default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Analyze this user feedback. Return JSON with: sentiment (positive/neutral/negative), themes (array of 2-3 keywords), insights (1 actionable sentence).'
            },
            {
              role: 'user',
              content: content
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        });

        const analysis = JSON.parse(completion.choices[0].message.content || '{}');

        // Update feedback with analysis
        await supabase
          .from('feedback')
          .update({
            sentiment: analysis.sentiment,
            themes: analysis.themes,
            insights: analysis.insights
          })
          .eq('id', feedback.id);
      } catch (err) {
        console.error('Error analyzing text feedback:', err);
        // Don't fail the request if analysis fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      feedbackId: feedback.id 
    });

  } catch (error) {
    console.error('Text feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

