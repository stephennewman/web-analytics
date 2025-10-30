import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }
  
  // Get feedback records
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error('Feedback list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Enrich with session data
  if (feedback && feedback.length > 0) {
    const sessionIds = feedback.map(f => f.session_id);
    const { data: sessions } = await supabase
      .from('sessions')
      .select('session_id, country, city, region, device_type, time_spent, pageviews, clicks, converted, has_intent, landing_page, referrer')
      .in('session_id', sessionIds);
    
    // Map sessions to feedback
    const sessionMap = new Map((sessions || []).map(s => [s.session_id, s]));
    const enrichedFeedback = feedback.map(f => ({
      ...f,
      sessions: sessionMap.get(f.session_id) || null
    }));
    
    return NextResponse.json({ feedback: enrichedFeedback });
  }
  
  return NextResponse.json({ feedback: [] });
}

