'use client';

import { Card } from '@tremor/react';
import { useMemo } from 'react';

interface RecentConversionsProps {
  sessions: any[];
}

export default function RecentConversions({ sessions }: RecentConversionsProps) {
  const recentConversions = useMemo(() => {
    return sessions
      .filter(s => s.converted)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10); // Last 10 conversions
  }, [sessions]);

  const last24Hours = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    return recentConversions.filter(s => 
      new Date(s.created_at).getTime() > oneDayAgo
    );
  }, [recentConversions]);

  const last7Days = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    return recentConversions.filter(s => 
      new Date(s.created_at).getTime() > sevenDaysAgo
    );
  }, [recentConversions]);

  function formatTimeAgo(timestamp: string) {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  function formatDateTime(timestamp: string) {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  if (recentConversions.length === 0) {
    return (
      <Card 
        decoration="top" 
        decorationColor="gray"
        className="shadow-[4px_4px_0px_rgba(0,0,0,0.2)] border-2 border-gray-200"
      >
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Conversions Yet</h3>
          <p className="text-sm text-gray-600">Conversions will appear here once visitors complete your conversion goals.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      decoration="top" 
      decorationColor="green"
      className="shadow-[4px_4px_0px_rgba(34,197,94,0.4)] border-2 border-green-200"
    >
      <div className="space-y-4">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🎉 Recent Conversions
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <span className="font-semibold text-green-700">{last24Hours.length}</span>
              <span className="text-gray-700 ml-1">today</span>
            </div>
            <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <span className="font-semibold text-blue-700">{last7Days.length}</span>
              <span className="text-gray-700 ml-1">this week</span>
            </div>
          </div>
        </div>

        {/* Conversion Timeline */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentConversions.map((session, idx) => {
            const isRecent = last24Hours.includes(session);
            const conversionEvent = session.events?.find((e: any) => e.event_type === 'conversion');
            const locationText = session.city && session.country 
              ? `${session.city}, ${session.country}`
              : session.country || 'Unknown';

            return (
              <div
                key={session.session_id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isRecent 
                    ? 'bg-green-50 border-green-300 hover:border-green-400' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top Row: Number badge, Location, Time ago */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isRecent ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                      {session.siteName && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                          🌐 {session.siteName}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        📍 {locationText}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isRecent 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {formatTimeAgo(session.created_at)}
                      </span>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span>🕐 {formatDateTime(session.created_at)}</span>
                      <span>👆 {session.clicks} clicks</span>
                      <span>📄 {session.pageviews} pages</span>
                      <span>⏱️ {Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s</span>
                      {session.deviceType && (
                        <span>📱 {session.deviceType}</span>
                      )}
                    </div>

                    {/* Landing Page */}
                    {session.landingPage && (
                      <div className="mt-2 text-xs text-gray-500 truncate">
                        <span className="font-medium">Entry:</span> {session.landingPage}
                      </div>
                    )}

                    {/* Conversion Details */}
                    {conversionEvent?.data && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {conversionEvent.data.button_text && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            🎯 {conversionEvent.data.button_text}
                          </span>
                        )}
                        {conversionEvent.data.value && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            💰 ${conversionEvent.data.value}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Visual indicator for new conversions */}
                  {isRecent && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        {recentConversions.length > 0 && (
          <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
            Showing {recentConversions.length} most recent conversion{recentConversions.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Card>
  );
}

