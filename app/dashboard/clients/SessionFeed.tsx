'use client';

import { useState } from 'react';

interface Session {
  id: string;
  session_id: string;
  converted: boolean;
  created_at: string;
  updated_at: string;
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
  const [filter, setFilter] = useState<'all' | 'converted' | 'intent' | 'frustrated' | 'errors'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'time' | 'pageviews'>('recent');

  // Filter sessions
  let filteredSessions = sessions;
  if (filter === 'converted') filteredSessions = sessions.filter(s => s.converted);
  if (filter === 'intent') filteredSessions = sessions.filter(s => s.hasIntent);
  if (filter === 'frustrated') filteredSessions = sessions.filter(s => s.hasFrustration);
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
            onClick={() => setFilter('frustrated')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'frustrated' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            😡 Frustrated ({sessions.filter(s => s.hasFrustration).length})
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
                session.hasFrustration ? 'border-red-500' :
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
                    {session.hasFrustration && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">😡 Frustrated</span>}
                    {session.hasErrors && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">🐛 Errors</span>}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{session.landingPage || 'Unknown page'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{new Date(session.updated_at).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{session.deviceType}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
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
                {session.phoneClicks > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">📞 {session.phoneClicks}</p>
                    <p className="text-xs text-gray-500">Phone</p>
                  </div>
                )}
                {session.emailClicks > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">✉️ {session.emailClicks}</p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                )}
                {session.formSubmits > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">✅ {session.formSubmits}</p>
                    <p className="text-xs text-gray-500">Forms</p>
                  </div>
                )}
                {session.rageClicks > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">😡 {session.rageClicks}</p>
                    <p className="text-xs text-gray-500">Rage</p>
                  </div>
                )}
                {session.deadClicks > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">⚠️ {session.deadClicks}</p>
                    <p className="text-xs text-gray-500">Dead</p>
                  </div>
                )}
              </div>

              {/* Referrer */}
              {session.referrer !== 'direct' && (
                <div className="text-xs text-gray-500 border-t pt-3">
                  From: {session.referrer}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

