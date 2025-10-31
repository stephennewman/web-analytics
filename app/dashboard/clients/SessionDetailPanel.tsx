'use client';

import AudioPlayer from './AudioPlayer';

interface SessionDetailPanelProps {
  session: any;
  onClose: () => void;
}

export default function SessionDetailPanel({ session, onClose }: SessionDetailPanelProps) {
  if (!session) return null;

  const clickEvents = session.events.filter((e: any) => e.event_type === 'click');
  const pageviews = session.events.filter((e: any) => e.event_type === 'pageview');

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Device</span>
              <span className="text-sm font-medium text-gray-900">{session.deviceType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm font-medium text-gray-900">{session.referrer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Time</span>
              <span className="text-sm font-medium text-gray-900">{Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Clicks</span>
              <span className="text-sm font-medium text-gray-900">{session.clicks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scroll Depth</span>
              <span className="text-sm font-medium text-gray-900">{session.scrollDepth}%</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {session.converted && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ✓ Converted
              </span>
            )}
            {session.hasIntent && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                🎯 High Intent
              </span>
            )}
            {session.hasFrustration && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                ⚠️ Friction Detected
              </span>
            )}
          </div>

          {/* Click Path */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🗺️</span>
              Journey Path
            </h3>
            <div className="space-y-2">
              {pageviews.map((event: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Click Summary */}
          {clickEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>👆</span>
                Click Activity
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Total clicks: <span className="font-medium text-gray-900">{clickEvents.length}</span>
                </p>
                {session.phoneClicks > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    📞 Phone clicks: <span className="font-medium text-green-700">{session.phoneClicks}</span>
                  </p>
                )}
                {session.emailClicks > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    ✉️ Email clicks: <span className="font-medium text-blue-700">{session.emailClicks}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Voice Feedback */}
          {session.events.some((e: any) => e.event_type === 'feedback_submitted') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎙️</span>
                Voice Feedback
              </h3>
              <div className="space-y-3">
                {session.events
                  .filter((e: any) => e.event_type === 'feedback_submitted')
                  .map((event: any, idx: number) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Feedback submitted
                        </span>
                        <span className="text-xs text-blue-600">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.data?.audio_url && (
                        <AudioPlayer src={event.data.audio_url} className="w-full mt-2" />
                      )}
                      {event.data?.duration && (
                        <p className="text-xs text-blue-600 mt-2">
                          Duration: {event.data.duration}s
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Engagement Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📊</span>
              Engagement
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 mb-1">Pages Viewed</p>
                <p className="text-2xl font-bold text-purple-700">{session.pageviews}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 mb-1">Active Time</p>
                <p className="text-2xl font-bold text-blue-700">{Math.floor(session.activeTime / 60)}m</p>
              </div>
            </div>
          </div>

          {/* Debug Info (collapsible) */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
              Debug Data
            </summary>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </>
  );
}

