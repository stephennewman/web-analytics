import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Batch update positions after drag-and-drop reordering
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { updates } = body; // Array of { id, custom_position, position_override }

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 });
  }

  try {
    // Batch update all tickets
    const promises = updates.map((update: any) => 
      supabase
        .from('tickets')
        .update({
          custom_position: update.custom_position,
          position_override: update.position_override,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id)
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('Error reordering tickets:', error);
    return NextResponse.json({ error: 'Failed to reorder tickets' }, { status: 500 });
  }
}

// Reset custom positions for a client (return to AI sorting)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const status = searchParams.get('status'); // Optional: clear only one column

  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('tickets')
      .update({
        custom_position: null,
        position_override: false,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId);

    if (status) {
      query = query.eq('status', status);
    }

    await query;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing custom positions:', error);
    return NextResponse.json({ error: 'Failed to clear positions' }, { status: 500 });
  }
}

