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
    
    // Clear GSC tokens and connection status
    const { error } = await supabase
      .from('clients')
      .update({
        google_search_console_connected: false,
        google_search_console_access_token: null,
        google_search_console_refresh_token: null,
        google_search_console_token_expiry: null
      })
      .eq('id', clientId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('GSC disconnect error:', err);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}

