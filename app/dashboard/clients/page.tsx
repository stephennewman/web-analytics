import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import ClientWrapper from './ClientWrapper';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ site?: string; view?: string }> }) {
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
  let isAllSites = false;
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
    const resolvedSearchParams = await searchParams;
    const selectedClientId = resolvedSearchParams.site;
    if (selectedClientId === 'all') {
      isAllSites = true;
      client = { id: 'all', name: 'All Sites', domain: '' }; // Virtual client for ALL view
    } else if (selectedClientId) {
      client = clients.find(c => c.id === selectedClientId) || clients[0];
    } else {
      client = clients[0];
    }
  }

  // Get the resolved search params for view
  const resolvedSearchParams = await searchParams;

  // Get sessions with their events
  let sessionsQuery = supabase
    .from('sessions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (isAllSites) {
    // Get sessions from all user's clients
    const clientIds = clients?.map(c => c.id) || [];
    sessionsQuery = sessionsQuery.in('client_id', clientIds);
  } else {
    sessionsQuery = sessionsQuery.eq('client_id', client.id);
  }

  const { data: sessions, error: sessionsError } = await sessionsQuery;

  // Debug logging
  console.log('Client ID:', client.id);
  console.log('User ID:', user.id);
  console.log('Sessions query error:', sessionsError);
  console.log('Sessions found:', sessions?.length || 0);

  // Get all events for these sessions
  const sessionIds = sessions?.map(s => s.session_id) || [];
  let eventsQuery = supabase
    .from('events')
    .select('*')
    .in('session_id', sessionIds)
    .order('timestamp', { ascending: false });

  if (isAllSites) {
    // Get events from all user's clients
    const clientIds = clients?.map(c => c.id) || [];
    eventsQuery = eventsQuery.in('client_id', clientIds);
  } else {
    eventsQuery = eventsQuery.eq('client_id', client.id);
  }

  const { data: allEvents, error: eventsError } = await eventsQuery;

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
    
    // Add site information for ALL view
    const siteInfo = isAllSites ? clients?.find(c => c.id === session.client_id) : null;
    
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
    
    // Extract IP address from _geo data
    const ipAddress = firstEventWithData?.data?._geo?.ip || 'unknown';
    
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
      ipAddress: ipAddress,
      hasIntent: phoneClicks.length > 0 || emailClicks.length > 0 || downloads.length > 0 || formSubmits.length > 0,
      hasFrustration: rageClicks.length > 0 || deadClicks.length > 0,
      hasErrors: jsErrors.length > 0,
      // Add site info for ALL view
      siteName: siteInfo?.name || 'Unknown Site',
      siteDomain: siteInfo?.domain || ''
    };
  }) || [];

  // Apply URL filtering to sessions based on client settings
  const filteredSessions = enrichedSessions.filter(session => {
    // Get the client's URL filters
    const clientData = isAllSites ? clients?.find(c => c.id === session.client_id) : client;
    const urlFilters = clientData?.url_filters || { enabled: true, patterns: ["localhost", "127.0.0.1", "0.0.0.0", "test.", "staging.", "dev."] };
    
    if (!urlFilters.enabled || !urlFilters.patterns) return true;
    
    // Check if any event URL or referrer matches filter patterns
    const shouldFilter = session.events?.some((event: any) => {
      return urlFilters.patterns.some((pattern: string) => {
        return (event.url && event.url.includes(pattern)) || 
               (event.data?.referrer && event.data.referrer.includes(pattern));
      });
    });
    
    if (shouldFilter) {
      console.log('Filtered out session:', {
        sessionId: session.session_id,
        landingPage: session.landingPage,
        patterns: urlFilters.patterns
      });
    }
    
    return !shouldFilter; // Keep sessions that don't match filter patterns
  });

  console.log(`URL Filtering: ${enrichedSessions.length} total sessions, ${filteredSessions.length} after filtering`);

  // Get summary stats
  let eventsCountQuery = supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  if (isAllSites) {
    const clientIds = clients?.map(c => c.id) || [];
    eventsCountQuery = eventsCountQuery.in('client_id', clientIds);
  } else {
    eventsCountQuery = eventsCountQuery.eq('client_id', client.id);
  }

  const { count: totalEvents } = await eventsCountQuery;

  const totalSessions = filteredSessions.length;
  const convertedSessions = filteredSessions.filter(s => s.converted).length;
  const conversionRate = totalSessions > 0 ? ((convertedSessions / totalSessions) * 100).toFixed(1) : '0';

  // Summary stats
  const totalPageviews = filteredSessions.reduce((sum, s) => sum + s.pageviews, 0);
  const totalClicks = filteredSessions.reduce((sum, s) => sum + s.clicks, 0);
  const totalPhoneClicks = filteredSessions.reduce((sum, s) => sum + s.phoneClicks, 0);
  const totalEmailClicks = filteredSessions.reduce((sum, s) => sum + s.emailClicks, 0);
  const sessionsWithIntent = filteredSessions.filter(s => s.hasIntent).length;
  const sessionsWithFrustration = filteredSessions.filter(s => s.hasFrustration).length;

  // Get the initial view from URL params
  const initialView = resolvedSearchParams.view || 'dashboard';

  return (
    <ClientWrapper
      email={user.email || ''}
      client={client}
      clients={clients || []}
      sessions={filteredSessions}
      initialView={initialView}
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

