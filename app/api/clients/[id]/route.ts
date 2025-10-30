import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, domain, url_filters, feedback_enabled } = body;

    if (!name && name !== undefined) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    const resolvedParams = await params;

    console.log('Updating client:', {
      id: resolvedParams.id,
      name,
      domain,
      feedback_enabled,
      user_id: user.id
    });

    // Update client
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    if (domain !== undefined) {
      updateData.domain = domain || '';
    }
    if (url_filters !== undefined) {
      updateData.url_filters = url_filters;
    }
    if (feedback_enabled !== undefined) {
      updateData.feedback_enabled = feedback_enabled;
    }

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id) // Ensure user owns this client
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json({ error: 'Failed to update site', details: error.message }, { status: 500 });
    }

    if (!updatedClient) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
