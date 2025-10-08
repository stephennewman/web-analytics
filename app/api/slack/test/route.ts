import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { SlackService } from '@/lib/slack-service';

export async function POST(request: NextRequest) {
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

    // Send a test message
    const slackService = new SlackService(slackIntegration.bot_token);
    const testMessage = {
      text: '🧪 Test message from Web Analytics',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*🧪 Test Message*\nThis is a test message from your Web Analytics integration. If you can see this, your Slack integration is working correctly!'
          }
        }
      ]
    };

    const success = await slackService.sendMessage(slackIntegration.channel_id, testMessage);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test message sent successfully!' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send test message' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Slack test error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

