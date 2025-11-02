import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('clients')
      .select('session_recording_enabled')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Error checking session recording status:', error);
      return NextResponse.json({ enabled: false });
    }

    return NextResponse.json({ 
      enabled: data?.session_recording_enabled || false 
    });
  } catch (error) {
    console.error('Error checking session recording status:', error);
    return NextResponse.json({ enabled: false });
  }
}

