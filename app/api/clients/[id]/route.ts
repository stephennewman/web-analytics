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
    const { name, domain, url_filters } = body;

    if (!name) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    const resolvedParams = await params;

    console.log('Updating client:', {
      id: resolvedParams.id,
      name,
      domain,
      user_id: user.id
    });

    // Update client
    const updateData: any = {
      name,
      domain: domain || '',
    };
    
    if (url_filters) {
      updateData.url_filters = url_filters;
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
