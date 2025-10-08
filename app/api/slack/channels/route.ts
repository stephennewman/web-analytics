import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { WebClient } from '@slack/web-api';

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
    const { data: slackIntegration } = await supabase
      .from('user_slack_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!slackIntegration) {
      return NextResponse.json({ error: 'No Slack integration found' }, { status: 404 });
    }

    // Get channels from Slack
    const slackClient = new WebClient(slackIntegration.bot_token);
    
    try {
      const result = await slackClient.conversations.list({
        types: 'public_channel,private_channel',
        limit: 100
      });

      const channels = result.channels?.map(channel => ({
        id: channel.id,
        name: channel.name,
        is_member: channel.is_member,
        is_private: channel.is_private
      })) || [];

      return NextResponse.json({ channels });
    } catch (slackError) {
      console.error('Slack channels error:', slackError);
      return NextResponse.json({ 
        error: 'Failed to fetch channels',
        details: slackError instanceof Error ? slackError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Channels API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

