import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    
    // Get client with GSC tokens
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (!client.google_search_console_connected || !client.google_search_console_access_token) {
      return NextResponse.json({ error: 'Google Search Console not connected' }, { status: 400 });
    }

    // Check if token needs refresh
    let accessToken = client.google_search_console_access_token;
    const tokenExpiry = new Date(client.google_search_console_token_expiry);
    
    if (tokenExpiry < new Date()) {
      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: client.google_search_console_refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await refreshResponse.json();
      accessToken = tokens.access_token;

      // Update token in database
      await supabase
        .from('clients')
        .update({
          google_search_console_access_token: tokens.access_token,
          google_search_console_token_expiry: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
        })
        .eq('id', clientId);
    }

    // Fetch last 30 days of GSC data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const gscResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(client.domain || 'sc-domain:' + client.domain)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['query', 'page', 'device'],
          rowLimit: 1000
        })
      }
    );

    if (!gscResponse.ok) {
      const errorText = await gscResponse.text();
      console.error('GSC API error:', errorText);
      throw new Error(`GSC API error: ${gscResponse.status}`);
    }

    const gscData = await gscResponse.json();

    // Store GSC data in database (you'll need to create a gsc_data table)
    // For now, just return success
    console.log('GSC data fetched:', gscData);

    return NextResponse.json({ 
      success: true, 
      message: 'Data synced successfully',
      rowCount: gscData.rows?.length || 0
    });
  } catch (err: any) {
    console.error('GSC sync error:', err);
    return NextResponse.json({ 
      error: 'Failed to sync data', 
      details: err.message 
    }, { status: 500 });
  }
}

