import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ enabled: false }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Get client settings
  const { data: client } = await supabase
    .from('clients')
    .select('feedback_enabled, feedback_widget_style')
    .eq('id', clientId)
    .single();
  
  if (!client?.feedback_enabled) {
    return NextResponse.json({ enabled: false }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
  
  // Get recent feedback quotes (last 10 completed transcripts)
  const { data: recentFeedback } = await supabase
    .from('feedback')
    .select('cleaned_transcript')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .not('cleaned_transcript', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  const recentQuotes = (recentFeedback || [])
    .map(f => f.cleaned_transcript)
    .filter(t => t && t.length > 10); // Only quotes with substance
  
  return NextResponse.json({ 
    enabled: true,
    style: client.feedback_widget_style || 'glassmorphic',
    recentQuotes: recentQuotes
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

