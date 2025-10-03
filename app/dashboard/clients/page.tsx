import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import SetupView from './SetupView';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get or create user's client
  let { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Create client if doesn't exist (for existing users before trigger)
  if (!client) {
    const { data: newClient } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: 'My Website',
        domain: '',
      })
      .select()
      .single();
    client = newClient;
  }

  // Get analytics data
  const { data: events, count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('client_id', client.id)
    .order('timestamp', { ascending: false })
    .limit(50);

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', client.id);

  const totalSessions = sessions?.length || 0;
  const convertedSessions = sessions?.filter(s => s.converted).length || 0;
  const conversionRate = totalSessions > 0 ? ((convertedSessions / totalSessions) * 100).toFixed(1) : '0';

  // Get event type counts
  const pageviews = events?.filter(e => e.event_type === 'pageview').length || 0;
  const clicks = events?.filter(e => e.event_type === 'click').length || 0;
  const formStarts = events?.filter(e => e.event_type === 'form_start').length || 0;
  const formSubmits = events?.filter(e => e.event_type === 'form_submit').length || 0;
  const conversions = events?.filter(e => e.event_type === 'conversion').length || 0;
  const rageClicks = events?.filter(e => e.event_type === 'rage_click').length || 0;
  const deadClicks = events?.filter(e => e.event_type === 'dead_click').length || 0;
  const exits = events?.filter(e => e.event_type === 'exit').length || 0;

  // Calculate average time on page
  const timeEvents = events?.filter(e => e.event_type === 'time_on_page' || e.event_type === 'exit') || [];
  const totalTime = timeEvents.reduce((sum, e) => sum + (e.data?.seconds || e.data?.time_spent || 0), 0);
  const avgTimeOnPage = timeEvents.length > 0 ? Math.round(totalTime / timeEvents.length) : 0;

  // Calculate average scroll depth
  const scrollEvents = events?.filter(e => e.event_type === 'scroll_depth') || [];
  const maxScrollDepth = scrollEvents.length > 0 ? Math.max(...scrollEvents.map(e => e.data?.depth || 0)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Web Analytics</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/api/auth/signout" method="post">
                <button className="text-sm text-red-600 hover:text-red-700">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SetupView 
          client={client}
          stats={{
            totalEvents: totalEvents || 0,
            pageviews,
            clicks,
            formStarts,
            formSubmits,
            conversions,
            totalSessions,
            convertedSessions,
            conversionRate,
            rageClicks,
            deadClicks,
            exits,
            avgTimeOnPage,
            maxScrollDepth
          }}
          recentEvents={events || []}
        />
      </main>
    </div>
  );
}

