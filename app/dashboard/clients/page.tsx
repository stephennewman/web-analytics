import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import ClientWrapper from './ClientWrapper';

export default async function DashboardPage({ searchParams }: { searchParams: { site?: string } }) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get all user's clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // Create default client if none exist
  let client;
  if (!clients || clients.length === 0) {
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
  } else {
    // Use selected site or first client as default
    const selectedClientId = searchParams.site;
    if (selectedClientId) {
      client = clients.find(c => c.id === selectedClientId) || clients[0];
    } else {
      client = clients[0];
    }
  }

  // Get sessions with their events
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', client.id)
    .order('updated_at', { ascending: false })
    .limit(50);

  // Debug logging
  console.log('Client ID:', client.id);
  console.log('User ID:', user.id);
  console.log('Sessions query error:', sessionsError);
  console.log('Sessions found:', sessions?.length || 0);

  // Get all events for these sessions
  const sessionIds = sessions?.map(s => s.session_id) || [];
  const { data: allEvents, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('client_id', client.id)
    .in('session_id', sessionIds)
    .order('timestamp', { ascending: false });

  console.log('Events query error:', eventsError);
  console.log('Events found:', allEvents?.length || 0);

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
    
    // Calculate total session time from first to last event
    let totalTimeSpent = 0;
    let activeTime = 0;
    
    if (events.length > 0) {
      const sortedEvents = [...events].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const firstEvent = sortedEvents[0];
      const lastEvent = sortedEvents[sortedEvents.length - 1];
      totalTimeSpent = Math.round(
        (new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()) / 1000
      );
      
      // Calculate active time by excluding idle periods
      const idleEvents = events.filter(e => e.event_type === 'idle');
      const tabReturnEvents = events.filter(e => e.event_type === 'tab_return');
      
      // Total idle time (60s per idle event)
      const totalIdleTime = idleEvents.length * 60;
      
      // Total time away from tab
      const totalAwayTime = tabReturnEvents.reduce((sum, e) => sum + (e.data?.away_seconds || 0), 0);
      
      // Active time = total time - idle time - away time
      activeTime = Math.max(0, totalTimeSpent - totalIdleTime - totalAwayTime);
    }
    
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
      timeSpent: totalTimeSpent,
      activeTime: activeTime,
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
    <ClientWrapper
      email={user.email || ''}
      client={client}
      clients={clients || []}
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
  );
}

