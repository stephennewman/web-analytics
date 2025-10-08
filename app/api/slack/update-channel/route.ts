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
    const { channel_id, channel_name } = body;

    if (!channel_id || !channel_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: channel_id, channel_name' 
      }, { status: 400 });
    }

    // Update the channel in the user's Slack integration
    const { data, error } = await supabase
      .from('user_slack_integrations')
      .update({
        channel_id,
        channel_name,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating channel:', error);
      return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      integration: {
        id: data.id,
        workspace_name: data.workspace_name,
        channel_name: data.channel_name,
        is_active: data.is_active
      }
    });

  } catch (error) {
    console.error('Update channel error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

