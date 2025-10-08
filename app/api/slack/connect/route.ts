import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      workspace_id, 
      workspace_name, 
      channel_id, 
      channel_name, 
      bot_token 
    } = body;

    if (!workspace_id || !workspace_name || !channel_id || !channel_name || !bot_token) {
      return NextResponse.json({ 
        error: 'Missing required fields: workspace_id, workspace_name, channel_id, channel_name, bot_token' 
      }, { status: 400 });
    }

    // Check if user already has a Slack integration
    const { data: existingIntegration } = await supabase
      .from('user_slack_integrations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let integration;
    if (existingIntegration) {
      // Update existing integration
      const { data, error } = await supabase
        .from('user_slack_integrations')
        .update({
          workspace_id,
          workspace_name,
          channel_id,
          channel_name,
          bot_token, // In production, encrypt this
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating Slack integration:', error);
        return NextResponse.json({ error: 'Failed to update Slack integration' }, { status: 500 });
      }
      integration = data;
    } else {
      // Create new integration
      const { data, error } = await supabase
        .from('user_slack_integrations')
        .insert({
          user_id: user.id,
          workspace_id,
          workspace_name,
          channel_id,
          channel_name,
          bot_token, // In production, encrypt this
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating Slack integration:', error);
        return NextResponse.json({ error: 'Failed to create Slack integration' }, { status: 500 });
      }
      integration = data;
    }

    return NextResponse.json({ 
      success: true, 
      integration: {
        id: integration.id,
        workspace_name: integration.workspace_name,
        channel_name: integration.channel_name,
        is_active: integration.is_active
      }
    });

  } catch (error) {
    console.error('Slack connect error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

