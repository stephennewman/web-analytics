import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Get sessions that have been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    let sessionsQuery = supabase
      .from('sessions')
      .select('id, session_id, updated_at')
      .gte('updated_at', fiveMinutesAgo);

    if (clientId === 'all') {
      // Get all user's clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);
      
      const clientIds = clients?.map(c => c.id) || [];
      sessionsQuery = sessionsQuery.in('client_id', clientIds);
    } else {
      sessionsQuery = sessionsQuery.eq('client_id', clientId);
    }

    const { data: sessions, error } = await sessionsQuery;

    if (error) {
      console.error('Live visitors query error:', error);
      return NextResponse.json({ error: 'Failed to fetch live visitors' }, { status: 500 });
    }

    return NextResponse.json({ count: sessions?.length || 0 });
  } catch (error) {
    console.error('Live visitors API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

