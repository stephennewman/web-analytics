import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const clientId = formData.get('clientId') as string;
    const sessionId = formData.get('sessionId') as string;
    const url = formData.get('url') as string;
    const duration = parseInt(formData.get('duration') as string);
    
    if (!audioFile || !clientId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Upload to Supabase Storage
    const fileName = `${sessionId}_${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('feedback-audio')
      .upload(fileName, audioFile, {
        contentType: 'audio/webm',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('feedback-audio')
      .getPublicUrl(fileName);
    
    // Create feedback record
    const { data: feedback, error: dbError } = await supabase
      .from('feedback')
      .insert({
        session_id: sessionId,
        client_id: clientId,
        audio_url: publicUrl,
        url: url,
        duration: duration,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    // Also create event in events table for timeline integration
    await supabase.from('events').insert({
      session_id: sessionId,
      client_id: clientId,
      event_type: 'feedback_submitted',
      url: url,
      data: {
        feedback_id: feedback.id,
        duration: duration,
        audio_url: publicUrl
      },
      timestamp: new Date().toISOString()
    });
    
    // Trigger transcription job (async)
    fetch(`${request.nextUrl.origin}/api/feedback/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId: feedback.id })
    }).catch(err => console.error('Transcription trigger failed:', err));
    
    return NextResponse.json({ success: true, feedbackId: feedback.id }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

