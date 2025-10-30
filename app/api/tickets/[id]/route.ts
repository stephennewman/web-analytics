import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await context.params;

  // Get ticket with all associated feedback
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      feedback:feedback(
        id,
        audio_url,
        cleaned_transcript,
        sentiment,
        themes,
        created_at,
        duration,
        url
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await context.params;
  const body = await request.json();
  const { status, priority, title, description, is_public } = body;

  const updateData: any = { updated_at: new Date().toISOString() };

  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (is_public !== undefined) updateData.is_public = is_public;

  const { data: updatedTicket, error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', resolvedParams.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }

  return NextResponse.json({ ticket: updatedTicket });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await context.params;

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', resolvedParams.id);

  if (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

