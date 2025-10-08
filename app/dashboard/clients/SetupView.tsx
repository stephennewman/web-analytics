'use client';

import { useState } from 'react';
import SessionFeed from './SessionFeed';
import VisitorsTable from './VisitorsTable';
import InsightsPanel from './InsightsPanel';
import NavigationFlow from './NavigationFlow';
import BestPath from './BestPath';
import DeviceLocationInsights from './DeviceLocationInsights';
import TimeOfDayHeatmap from './TimeOfDayHeatmap';
import ExitAnalysis from './ExitAnalysis';
import ScrollEngagement from './ScrollEngagement';
import SessionDetailPanel from './SessionDetailPanel';
import SlackSettings from './SlackSettings';

interface Client {
  id: string;
  name: string;
  domain: string;
}

interface Stats {
  totalSessions: number;
  convertedSessions: number;
  conversionRate: string;
  totalPageviews: number;
  totalClicks: number;
  totalPhoneClicks: number;
  totalEmailClicks: number;
  sessionsWithIntent: number;
  sessionsWithFrustration: number;
  totalEvents: number;
}

interface SetupViewProps {
  client: Client;
  sessions: any[];
  stats: Stats;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function SetupView({ 
  client, 
  sessions,
  stats,
  activeView,
  onViewChange
}: SetupViewProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  const trackingScript = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/track.js?id=${client.id}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render different views based on activeView
  const renderView = () => {
    if (sessions.length === 0) {
      // Show different message for ALL view vs single site
      if (client.id === 'all') {
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Sites View</h3>
              <p className="text-gray-600 mb-6">
                This view shows data from all your sites combined. Switch to a specific site to see its tracking script.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> Use the site switcher above to view individual sites and get their tracking scripts.
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Started with Analytics</h3>
              <p className="text-gray-600 mb-6">
                Install this tracking script on your website to start collecting visitor insights.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm break-all mb-4">
                {trackingScript}
              </div>
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg font-medium transition-all cursor-pointer"
              >
                {copied ? '✓ Copied!' : 'Copy Tracking Script'}
              </button>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> To test immediately, create an HTML file with this script and visit it in your browser. Refresh this page to see your data!
                </p>
              </div>
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-600 cursor-pointer">Debug Info</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                  <div>Client ID: {client.id}</div>
                  <div className="mt-1">User ID: Check browser console</div>
                </div>
              </details>
            </div>
          </div>
        );
      }
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <>
            {/* Quick Stats Bar - Dashboard Only */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-1">Pageviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPageviews}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-1">High Intent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sessionsWithIntent}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-1">Curious Explorers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sessionsWithFrustration}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
              <InsightsPanel sessions={sessions} />
            </div>
          </>
        );

      case 'live':
        // Get sessions updated in the last 5 minutes
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        const liveSessions = sessions.filter(s => {
          const lastUpdate = new Date(s.updated_at).getTime();
          return lastUpdate > fiveMinutesAgo;
        });

        return (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-gray-900">
                    {liveSessions.length} {liveSessions.length === 1 ? 'Visitor' : 'Visitors'} Online
                  </span>
                </div>
                <span className="text-xs text-gray-500">Last 5 minutes</span>
              </div>
            </div>

            {liveSessions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👀</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Visitors</h3>
                <p className="text-gray-600">
                  No one has visited your site in the last 5 minutes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveSessions.map((session) => {
                  const lastUpdate = new Date(session.updated_at);
                  const secondsAgo = Math.floor((now - lastUpdate.getTime()) / 1000);
                  const minutesAgo = Math.floor(secondsAgo / 60);
                  const timeAgo = minutesAgo > 0 ? `${minutesAgo}m ago` : `${secondsAgo}s ago`;
                  
                  // Get most recent pageview
                  const pageviews = session.events
                    .filter((e: any) => e.event_type === 'pageview')
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                  const currentPage = pageviews[0]?.url || session.landingPage || 'Unknown page';

                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition p-4 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {currentPage}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>📱 {session.deviceType}</span>
                            {session.city && <span>📍 {session.city}, {session.region || session.country}</span>}
                            <span>⏱️ {Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s</span>
                            <span className="text-gray-400">{timeAgo}</span>
                          </div>
                          {session.hasIntent && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                🎯 High Intent
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      case 'visitors':
        return (
          <VisitorsTable sessions={sessions} onSelectSession={setSelectedSession} />
        );

      case 'insights':
        return (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <BestPath sessions={sessions} />
              <NavigationFlow sessions={sessions} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <DeviceLocationInsights sessions={sessions} />
              <TimeOfDayHeatmap sessions={sessions} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ScrollEngagement sessions={sessions} />
              <ExitAnalysis sessions={sessions} />
            </div>
          </>
        );

      case 'settings':
        return (
          <div className="max-w-2xl">
            <SlackSettings />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Main Content */}
        {renderView()}
      </div>

      {/* Session Detail Panel */}
      {selectedSession && (
        <SessionDetailPanel 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </>
  );
}

