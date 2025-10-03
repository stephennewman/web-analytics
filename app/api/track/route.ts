import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, sessionId, event, url, data, timestamp } = body;
    
    // Extract IP address and geo headers (Vercel provides these)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const country = request.headers.get('x-vercel-ip-country') || null;
    const region = request.headers.get('x-vercel-ip-country-region') || null;
    const city = request.headers.get('x-vercel-ip-city') || null;
    
    console.log('Received tracking request:', { clientId, sessionId, event, url, ip, country, city });

    // Validate required fields
    if (!clientId || !sessionId || !event || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, sessionId, event, url' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Client lookup error:', clientError);
      return NextResponse.json(
        { error: 'Invalid clientId', details: clientError?.message },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Enrich data with server-side geo info
    const enrichedData = {
      ...(data || {}),
      _geo: {
        ip,
        country,
        region,
        city
      }
    };

    // Insert event
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        client_id: clientId,
        session_id: sessionId,
        event_type: event,
        url,
        data: enrichedData,
        timestamp: timestamp || new Date().toISOString(),
      });

    if (eventError) {
      console.error('Event insert error:', eventError);
      return NextResponse.json(
        { error: 'Failed to insert event' },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Update or create session
    // First, check if session exists
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id, country, city, timezone, language')
      .eq('session_id', sessionId)
      .single();

    const sessionUpdate: any = {
      client_id: clientId,
      session_id: sessionId,
      updated_at: new Date().toISOString(),
    };

    if (event === 'conversion') {
      sessionUpdate.converted = true;
    }

    // Add location data - only if not already set (preserve first pageview data)
    if (!existingSession || !existingSession.country) {
      if (country) sessionUpdate.country = country;
      if (city) sessionUpdate.city = city;
    }
    if (!existingSession || !existingSession.timezone) {
      if (data?.timezone) sessionUpdate.timezone = data.timezone;
      if (data?.language) sessionUpdate.language = data.language;
    }

    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert(sessionUpdate, { onConflict: 'session_id' });

    if (sessionError) {
      console.error('Session upsert error:', sessionError);
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Enable CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

