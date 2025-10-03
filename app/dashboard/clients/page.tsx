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

  // Get sessions with their events
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', client.id)
    .order('updated_at', { ascending: false })
    .limit(50);

  // Get all events for these sessions
  const sessionIds = sessions?.map(s => s.session_id) || [];
  const { data: allEvents } = await supabase
    .from('events')
    .select('*')
    .eq('client_id', client.id)
    .in('session_id', sessionIds)
    .order('timestamp', { ascending: false });

  // Group events by session
  const sessionEvents: Record<string, any[]> = {};
  allEvents?.forEach(event => {
    if (!sessionEvents[event.session_id]) {
      sessionEvents[event.session_id] = [];
    }
    sessionEvents[event.session_id].push(event);
  });

  // Enrich sessions with their events and calculated metrics
  const enrichedSessions = sessions?.map(session => {
    const events = sessionEvents[session.session_id] || [];
    const pageviews = events.filter(e => e.event_type === 'pageview');
    const clicks = events.filter(e => e.event_type === 'click');
    const phoneClicks = events.filter(e => e.event_type === 'phone_click');
    const emailClicks = events.filter(e => e.event_type === 'email_click');
    const downloads = events.filter(e => e.event_type === 'download_click');
    const formSubmits = events.filter(e => e.event_type === 'form_submit');
    const rageClicks = events.filter(e => e.event_type === 'rage_click');
    const deadClicks = events.filter(e => e.event_type === 'dead_click');
    const jsErrors = events.filter(e => e.event_type === 'js_error');
    const exitEvent = events.find(e => e.event_type === 'exit');
    const perfEvent = events.find(e => e.event_type === 'performance');
    const scrollEvents = events.filter(e => e.event_type === 'scroll_depth');
    
    // Count unique pages visited (not total pageview events)
    const uniquePages = new Set(pageviews.map((e: any) => e.url)).size;
    
    // Find first event with device data (some early pageviews may be empty)
    const firstEventWithData = events.slice().reverse().find((e: any) => e.data?.device_type || e.data?.referrer);
    const deviceData = firstEventWithData?.data || {};
    
    return {
      ...session,
      events,
      pageviews: uniquePages,
      clicks: clicks.length,
      phoneClicks: phoneClicks.length,
      emailClicks: emailClicks.length,
      downloads: downloads.length,
      formSubmits: formSubmits.length,
      rageClicks: rageClicks.length,
      deadClicks: deadClicks.length,
      jsErrors: jsErrors.length,
      timeSpent: exitEvent?.data?.time_spent || 0,
      scrollDepth: scrollEvents.length > 0 ? Math.max(...scrollEvents.map((e: any) => e.data?.depth || 0)) : 0,
      loadTime: perfEvent?.data?.load_time || 0,
      deviceType: deviceData.device_type || 'unknown',
      referrer: deviceData.referrer || 'direct',
      landingPage: pageviews[pageviews.length - 1]?.url || '',
      hasIntent: phoneClicks.length > 0 || emailClicks.length > 0 || downloads.length > 0 || formSubmits.length > 0,
      hasFrustration: rageClicks.length > 0 || deadClicks.length > 0,
      hasErrors: jsErrors.length > 0
    };
  }) || [];

  // Get summary stats
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', client.id);

  const totalSessions = enrichedSessions.length;
  const convertedSessions = enrichedSessions.filter(s => s.converted).length;
  const conversionRate = totalSessions > 0 ? ((convertedSessions / totalSessions) * 100).toFixed(1) : '0';

  // Summary stats
  const totalPageviews = enrichedSessions.reduce((sum, s) => sum + s.pageviews, 0);
  const totalClicks = enrichedSessions.reduce((sum, s) => sum + s.clicks, 0);
  const totalPhoneClicks = enrichedSessions.reduce((sum, s) => sum + s.phoneClicks, 0);
  const totalEmailClicks = enrichedSessions.reduce((sum, s) => sum + s.emailClicks, 0);
  const sessionsWithIntent = enrichedSessions.filter(s => s.hasIntent).length;
  const sessionsWithFrustration = enrichedSessions.filter(s => s.hasFrustration).length;

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
          sessions={enrichedSessions}
          stats={{
            totalSessions,
            convertedSessions,
            conversionRate,
            totalPageviews,
            totalClicks,
            totalPhoneClicks,
            totalEmailClicks,
            sessionsWithIntent,
            sessionsWithFrustration,
            totalEvents: totalEvents || 0
          }}
        />
      </main>
    </div>
  );
}

