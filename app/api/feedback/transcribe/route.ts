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

