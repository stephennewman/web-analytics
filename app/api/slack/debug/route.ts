import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Get all Slack integrations (for debugging)
    const { data: allIntegrations } = await supabase
      .from('user_slack_integrations')
      .select('*');

    // Get current user's integration
    const { data: userIntegration } = await supabase
      .from('user_slack_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ 
      currentUser: {
        id: user.id,
        email: user.email
      },
      allIntegrations,
      userIntegration: userIntegration || null
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

