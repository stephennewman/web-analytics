import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client (lazy to avoid build-time errors)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const {
      clientId,
      sessionId,
      visitorId,
      url,
      pageTitle,
      events,
      durationMs,
      viewport,
      deviceType
    } = body;

    if (!clientId || !sessionId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if recording already exists (update) or create new
    const { data: existing } = await supabase
      .from('session_recordings')
      .select('id, events, events_count')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Append events to existing recording
      const existingEvents = existing.events as any[];
      const mergedEvents = [...existingEvents, ...events];

      await supabase
        .from('session_recordings')
        .update({
          events: mergedEvents,
          events_count: mergedEvents.length,
          duration_ms: durationMs,
          ended_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return NextResponse.json({ success: true, recordingId: existing.id });
    } else {
      // Create new recording
      const { data, error } = await supabase
        .from('session_recordings')
        .insert({
          client_id: clientId,
          session_id: sessionId,
          visitor_id: visitorId,
          url,
          page_title: pageTitle,
          user_agent: request.headers.get('user-agent') || '',
          viewport_width: viewport?.width,
          viewport_height: viewport?.height,
          device_type: deviceType,
          events,
          events_count: events.length,
          duration_ms: durationMs,
          is_masked: true,
          consent_given: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session recording:', error);
        return NextResponse.json(
          { error: 'Failed to save recording', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, recordingId: data.id });
    }
  } catch (error: any) {
    console.error('Session recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET: List recordings for a client
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('session_recordings')
      .select('*')
      .eq('client_id', clientId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching recordings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recordings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recordings: data });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

