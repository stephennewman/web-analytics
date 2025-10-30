import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  // Get tickets with feedback count
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      feedback:feedback(count)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }

  return NextResponse.json({ tickets: tickets || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { client_id, title, description, priority, is_public } = body;

  if (!client_id || !title) {
    return NextResponse.json({ error: 'Client ID and title required' }, { status: 400 });
  }

  const { data: newTicket, error } = await supabase
    .from('tickets')
    .insert({
      client_id,
      title,
      description,
      status: 'new',
      priority,
      is_public: is_public !== undefined ? is_public : true,
      feedback_count: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }

  return NextResponse.json({ ticket: newTicket });
}

