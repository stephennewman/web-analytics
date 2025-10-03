'use client';

import { useState } from 'react';

interface Session {
  id: string;
  session_id: string;
  converted: boolean;
  created_at: string;
  updated_at: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  language?: string;
  pageviews: number;
  clicks: number;
  phoneClicks: number;
  emailClicks: number;
  downloads: number;
  formSubmits: number;
  rageClicks: number;
  deadClicks: number;
  jsErrors: number;
  timeSpent: number;
  scrollDepth: number;
  loadTime: number;
  deviceType: string;
  referrer: string;
  landingPage: string;
  hasIntent: boolean;
  hasFrustration: boolean;
  hasErrors: boolean;
  events: any[];
}

export default function SessionFeed({ sessions }: { sessions: Session[] }) {
  const [filter, setFilter] = useState<'all' | 'converted' | 'intent' | 'issues' | 'errors'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'time' | 'pageviews'>('recent');
  const [expandedDebug, setExpandedDebug] = useState<Set<string>>(new Set());

  // Filter sessions
  let filteredSessions = sessions;
  if (filter === 'converted') filteredSessions = sessions.filter(s => s.converted);
  if (filter === 'intent') filteredSessions = sessions.filter(s => s.hasIntent);
  if (filter === 'issues') filteredSessions = sessions.filter(s => s.hasFrustration);
  if (filter === 'errors') filteredSessions = sessions.filter(s => s.hasErrors);

  // Sort sessions
  if (sortBy === 'time') filteredSessions = [...filteredSessions].sort((a, b) => b.timeSpent - a.timeSpent);
  if (sortBy === 'pageviews') filteredSessions = [...filteredSessions].sort((a, b) => b.pageviews - a.pageviews);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('converted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'converted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Converted ({sessions.filter(s => s.converted).length})
          </button>
          <button
            onClick={() => setFilter('intent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'intent' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎯 High Intent ({sessions.filter(s => s.hasIntent).length})
          </button>
          <button
            onClick={() => setFilter('issues')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'issues' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚠️ UX Issues ({sessions.filter(s => s.hasFrustration).length})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'errors' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐛 Errors ({sessions.filter(s => s.hasErrors).length})
          </button>
          
          <div className="ml-auto flex gap-2 items-center">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="time">Time Spent</option>
              <option value="pageviews">Pageviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Session Feed */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No sessions match this filter
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${
                session.converted ? 'border-green-500' :
                session.hasIntent ? 'border-purple-500' :
                session.hasFrustration ? 'border-yellow-500' :
                session.hasErrors ? 'border-orange-500' :
                'border-gray-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-gray-500">
                      {session.session_id.substring(4, 16)}...
                    </span>
                    {session.converted && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">✅ Converted</span>}
                    {session.hasIntent && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">🎯 High Intent</span>}
                    {session.hasFrustration && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">⚠️ UX Issues</span>}
                    {session.hasErrors && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">🐛 Errors</span>}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{session.landingPage || 'Unknown page'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{new Date(session.updated_at).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{session.deviceType}</p>
                </div>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-4 gap-3 mb-4 pb-4 border-b">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{session.pageviews}</p>
                  <p className="text-xs text-gray-500">Pages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{session.clicks}</p>
                  <p className="text-xs text-gray-500">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{session.timeSpent}s</p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{session.scrollDepth}%</p>
                  <p className="text-xs text-gray-500">Scroll</p>
                </div>
              </div>

              {/* Conversion Signals */}
              {(session.phoneClicks > 0 || session.emailClicks > 0 || session.downloads > 0 || session.formSubmits > 0) && (
                <div className="mb-4 pb-4 border-b">
                  <h4 className="text-xs font-semibold text-green-700 mb-2">🎯 CONVERSION SIGNALS</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.phoneClicks > 0 && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">📞 {session.phoneClicks} phone clicks</span>}
                    {session.emailClicks > 0 && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">✉️ {session.emailClicks} email clicks</span>}
                    {session.downloads > 0 && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">📥 {session.downloads} downloads</span>}
                    {session.formSubmits > 0 && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">✅ {session.formSubmits} form submits</span>}
                  </div>
                </div>
              )}

              {/* UX Issues */}
              {(session.rageClicks > 0 || session.deadClicks > 0 || session.jsErrors > 0) && (
                <div className="mb-4 pb-4 border-b">
                  <h4 className="text-xs font-semibold text-yellow-700 mb-2">⚠️ UX ISSUES DETECTED</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.rageClicks > 0 && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">😡 {session.rageClicks} rage clicks</span>}
                    {session.deadClicks > 0 && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">⚠️ {session.deadClicks} non-interactive clicks</span>}
                    {session.jsErrors > 0 && <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">🐛 {session.jsErrors} JS errors</span>}
                  </div>
                </div>
              )}

              {/* Engagement Details */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">📊 ENGAGEMENT</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {session.events.filter(e => e.event_type === 'copy_text').length > 0 && (
                    <div className="bg-blue-50 px-2 py-1 rounded">
                      📋 {session.events.filter(e => e.event_type === 'copy_text').length} text copies
                    </div>
                  )}
                  {session.events.filter(e => e.event_type === 'tab_return').length > 0 && (
                    <div className="bg-indigo-50 px-2 py-1 rounded">
                      👁️ {session.events.filter(e => e.event_type === 'tab_return').length} tab switches
                    </div>
                  )}
                  {session.events.filter(e => e.event_type === 'idle').length > 0 && (
                    <div className="bg-gray-50 px-2 py-1 rounded">
                      💤 {session.events.filter(e => e.event_type === 'idle').length} idle periods
                    </div>
                  )}
                  {session.events.filter(e => e.event_type === 'orientation_change').length > 0 && (
                    <div className="bg-purple-50 px-2 py-1 rounded">
                      🔄 {session.events.filter(e => e.event_type === 'orientation_change').length} rotations
                    </div>
                  )}
                  {session.events.filter(e => e.event_type === 'field_correction').length > 0 && (
                    <div className="bg-yellow-50 px-2 py-1 rounded">
                      ✏️ {session.events.filter(e => e.event_type === 'field_correction').length} field corrections
                    </div>
                  )}
                  {session.events.filter(e => e.event_type === 'field_time').length > 0 && (
                    <div className="bg-orange-50 px-2 py-1 rounded">
                      ⏱️ {session.events.filter(e => e.event_type === 'field_time').length} field interactions
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className="text-xs text-gray-600 space-y-1">
                {session.loadTime > 0 && (
                  <div className={`${session.loadTime > 3000 ? 'text-orange-600 font-medium' : ''}`}>
                    ⚡ Load time: {(session.loadTime / 1000).toFixed(2)}s {session.loadTime > 3000 && '(SLOW!)'}
                  </div>
                )}
                {(() => {
                  const firstEvent = session.events[session.events.length - 1];
                  const screenWidth = firstEvent?.data?.screen_width;
                  const screenHeight = firstEvent?.data?.screen_height;
                  const viewportWidth = firstEvent?.data?.viewport_width;
                  const viewportHeight = firstEvent?.data?.viewport_height;
                  
                  if (screenWidth && screenHeight) {
                    return (
                      <div>
                        📱 Screen: {screenWidth}x{screenHeight} {viewportWidth && viewportHeight && `(viewport: ${viewportWidth}x${viewportHeight})`}
                      </div>
                    );
                  }
                  return null;
                })()}
                {session.referrer !== 'direct' && (
                  <div>🔗 From: {session.referrer}</div>
                )}
                {/* Location data - prefer session columns, fallback to event data */}
                {(() => {
                  const firstEvent = session.events[session.events.length - 1];
                  const eventGeo = firstEvent?.data?._geo;
                  
                  // Use session columns first, then fallback to event data
                  const city = session.city || eventGeo?.city;
                  const region = session.region || eventGeo?.region;
                  const country = session.country || eventGeo?.country;
                  const timezone = session.timezone || firstEvent?.data?.timezone;
                  const language = session.language || firstEvent?.data?.language;
                  
                  return (
                    <>
                      {(city || region || country) && (
                        <div className="bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                          🌍 {city ? `${city}, ` : ''}{region ? `${region}, ` : ''}{country || 'Unknown'}
                        </div>
                      )}
                      {timezone && (
                        <div className="text-gray-500">
                          🕐 {timezone}
                        </div>
                      )}
                      {language && (
                        <div className="text-gray-500">
                          🗣️ {language}
                        </div>
                      )}
                    </>
                  );
                })()}
                {(() => {
                  const firstEvent = session.events[session.events.length - 1];
                  const utm = firstEvent?.data?.utm;
                  if (utm) {
                    return (
                      <div className="bg-purple-50 px-2 py-1 rounded">
                        📢 Campaign: {utm.utm_source || ''} / {utm.utm_medium || ''} {utm.utm_campaign && `/ ${utm.utm_campaign}`}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Debug Section - Toggle */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedDebug);
                    if (newExpanded.has(session.id)) {
                      newExpanded.delete(session.id);
                    } else {
                      newExpanded.add(session.id);
                    }
                    setExpandedDebug(newExpanded);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 font-mono"
                >
                  {expandedDebug.has(session.id) ? '▼' : '▶'} Debug Data
                </button>
                
                {expandedDebug.has(session.id) && (
                  <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-x-auto">
                    <div className="space-y-2">
                      <div><strong>Session Columns:</strong></div>
                      <div className="ml-4">
                        <div>country: {session.country || 'null'}</div>
                        <div>region: {session.region || 'null'}</div>
                        <div>city: {session.city || 'null'}</div>
                        <div>timezone: {session.timezone || 'null'}</div>
                        <div>language: {session.language || 'null'}</div>
                      </div>
                      
                      <div className="mt-3"><strong>First Event Data:</strong></div>
                      <div className="ml-4">
                        {(() => {
                          const firstEvent = session.events[session.events.length - 1];
                          if (!firstEvent) return <div>No events</div>;
                          return (
                            <>
                              <div>_geo: {JSON.stringify(firstEvent?.data?._geo || null)}</div>
                              <div>timezone: {firstEvent?.data?.timezone || 'null'}</div>
                              <div>language: {firstEvent?.data?.language || 'null'}</div>
                              <div>utm: {JSON.stringify(firstEvent?.data?.utm || null)}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

