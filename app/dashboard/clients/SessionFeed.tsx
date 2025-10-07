'use client';

import { useState } from 'react';
import ClickPath from './ClickPath';
import ClickAnalysis from './ClickAnalysis';

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
  activeTime: number;
  scrollDepth: number;
  loadTime: number;
  deviceType: string;
  referrer: string;
  landingPage: string;
  hasIntent: boolean;
  hasFrustration: boolean;
  hasErrors: boolean;
  events: any[];
  siteName?: string;
  siteDomain?: string;
}

export default function SessionFeed({ sessions, onSelectSession }: { sessions: Session[], onSelectSession?: (session: Session) => void }) {
  const [filter, setFilter] = useState<'all' | 'converted' | 'intent' | 'issues' | 'errors'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'time' | 'pageviews'>('recent');

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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('converted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              filter === 'converted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Converted ({sessions.filter(s => s.converted).length})
          </button>
          <button
            onClick={() => setFilter('intent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              filter === 'intent' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎯 High Intent ({sessions.filter(s => s.hasIntent).length})
          </button>
          <button
            onClick={() => setFilter('issues')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              filter === 'issues' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Curious Clicks ({sessions.filter(s => s.hasFrustration).length})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="time">Time Spent</option>
              <option value="pageviews">Pageviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Session Feed */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No sessions match this filter
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession?.(session)}
              className={`bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition p-5 cursor-pointer border-l-4 ${
                session.converted ? 'border-l-green-500' :
                session.hasIntent ? 'border-l-purple-500' :
                session.hasFrustration ? 'border-l-blue-400' :
                session.hasErrors ? 'border-l-orange-500' :
                'border-l-gray-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {session.converted && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">✓ Converted</span>}
                    {session.hasIntent && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">🎯 High Intent</span>}
                    {session.hasFrustration && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">🔍 Curious</span>}
                    {session.hasErrors && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">⚠️ Errors</span>}
                    {session.siteName && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                        {session.siteName} {session.siteDomain && `(${session.siteDomain})`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 font-medium truncate">{session.landingPage || 'Unknown page'}</p>
                  <p className="text-xs text-gray-500 mt-1">{session.deviceType} · {new Date(session.updated_at).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{session.pageviews}</p>
                  <p className="text-xs text-gray-500">Pages</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{session.clicks}</p>
                  <p className="text-xs text-gray-500">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {session.timeSpent >= 60 
                      ? `${Math.floor(session.timeSpent / 60)}m`
                      : `${session.timeSpent}s`
                    }
                  </p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{session.scrollDepth}%</p>
                  <p className="text-xs text-gray-500">Scroll</p>
                </div>
                <div className="text-center">
                  {session.phoneClicks > 0 || session.emailClicks > 0 ? (
                    <p className="text-lg font-bold text-green-600">🎯</p>
                  ) : (
                    <p className="text-lg font-bold text-gray-300">—</p>
                  )}
                  <p className="text-xs text-gray-500">Intent</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

