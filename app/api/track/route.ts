import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SlackService } from '@/lib/slack-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper function to send real-time Slack notifications
async function sendSlackNotification(supabase: any, clientId: string, event: string, sessionData: any, clientName: string) {
  try {
    // Get client's user and their Slack integration
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (!client) return;

    const { data: slackIntegration } = await supabase
      .from('user_slack_integrations')
      .select('*')
      .eq('user_id', client.user_id)
      .eq('is_active', true)
      .single();

    if (!slackIntegration || !slackIntegration.alert_preferences) return;

    const preferences = slackIntegration.alert_preferences;
    let shouldNotify = false;
    let message;

    // Check if this event type should trigger a notification
    if (event === 'conversion' && preferences.conversions) {
      shouldNotify = true;
      message = SlackService.formatConversionAlert(clientName, sessionData);
    } else if (['phone_click', 'email_click', 'form_submit'].includes(event) && preferences.high_intent) {
      shouldNotify = true;
      message = SlackService.formatHighIntentAlert(clientName, event, sessionData);
    } else if (['rage_click', 'js_error'].includes(event) && preferences.frustration) {
      shouldNotify = true;
      message = SlackService.formatFrustrationAlert(clientName, event, sessionData);
    }

    if (shouldNotify && message) {
      const slackService = new SlackService(slackIntegration.bot_token);
      await slackService.sendMessage(slackIntegration.channel_id, message);
    }
  } catch (error) {
    console.error('Slack notification error:', error);
    // Don't throw - we don't want Slack failures to break tracking
  }
}

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
    const cityRaw = request.headers.get('x-vercel-ip-city') || null;
    const city = cityRaw ? decodeURIComponent(cityRaw) : null;
    
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

    // Verify client exists and get URL filters
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, url_filters')
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

    // Check URL filters
    const urlFilters = client.url_filters || { enabled: true, patterns: ["localhost", "127.0.0.1", "0.0.0.0", "test.", "staging.", "dev."] };
    if (urlFilters.enabled && urlFilters.patterns) {
      const shouldFilter = urlFilters.patterns.some((pattern: string) => {
        // Check if URL contains any of the filter patterns
        return url.includes(pattern) || (data?.referrer && data.referrer.includes(pattern));
      });
      
      if (shouldFilter) {
        console.log('Filtered out URL:', { url, referrer: data?.referrer, patterns: urlFilters.patterns });
        return NextResponse.json(
          { success: true, filtered: true },
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
      if (region) sessionUpdate.region = region;
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

    // Send real-time Slack notification for important events
    // Don't await - we want this to be non-blocking
    sendSlackNotification(supabase, clientId, event, enrichedData, client.name).catch(console.error);

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

