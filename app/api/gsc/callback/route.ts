import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This is the clientId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/clients?error=gsc_auth_failed`);
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  const clientId = state;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gsc/callback`,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in Supabase
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        google_search_console_connected: true,
        google_search_console_access_token: tokens.access_token,
        google_search_console_refresh_token: tokens.refresh_token,
        google_search_console_token_expiry: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
      })
      .eq('id', clientId);

    if (updateError) {
      throw updateError;
    }

    // Redirect back to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/clients?site=${clientId}&view=settings&success=gsc_connected`);
  } catch (err) {
    console.error('GSC OAuth error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/clients?error=gsc_connection_failed`);
  }
}

