import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }
  
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select(`
      *,
      sessions!inner (
        session_id,
        country,
        city,
        region,
        device_type,
        time_spent,
        pageviews,
        clicks,
        converted,
        has_intent,
        landing_page,
        referrer
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error('Feedback list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ feedback: feedback || [] });
}

