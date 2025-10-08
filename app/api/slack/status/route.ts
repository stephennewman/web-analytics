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

    // Get user's Slack integration
    const { data: integration, error } = await supabase
      .from('user_slack_integrations')
      .select('id, workspace_name, channel_name, is_active, alert_preferences, created_at')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching Slack integration:', error);
      return NextResponse.json({ error: 'Failed to fetch Slack integration' }, { status: 500 });
    }

    return NextResponse.json({ 
      connected: !!integration,
      integration: integration || null
    });

  } catch (error) {
    console.error('Slack status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

