'use client';

import { useState } from 'react';

interface Event {
  id: string;
  event_type: string;
  url: string;
  timestamp: string;
  session_id: string;
  data?: any;
}

interface Client {
  id: string;
  name: string;
  domain: string;
}

interface Stats {
  totalEvents: number;
  pageviews: number;
  clicks: number;
  formStarts: number;
  formSubmits: number;
  conversions: number;
  totalSessions: number;
  convertedSessions: number;
  conversionRate: string;
  rageClicks: number;
  deadClicks: number;
  exits: number;
  avgTimeOnPage: number;
  maxScrollDepth: number;
  avgLoadTime: number;
  phoneClicks: number;
  emailClicks: number;
  downloads: number;
  jsErrors: number;
  copyEvents: number;
}

export default function SetupView({ 
  client, 
  stats,
  recentEvents 
}: { 
  client: Client;
  stats: Stats;
  recentEvents: Event[];
}) {
  const [copied, setCopied] = useState(false);
  
  const trackingScript = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/track.js?id=${client.id}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm">Total Pageviews</p>
            <p className="text-4xl font-bold mt-2">{stats.pageviews}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Unique Sessions</p>
            <p className="text-4xl font-bold mt-2">{stats.totalSessions}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Conversion Rate</p>
            <p className="text-4xl font-bold mt-2">{stats.conversionRate}%</p>
            <p className="text-xs text-blue-200 mt-1">
              {stats.convertedSessions} of {stats.totalSessions} converted
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h3 className="text-lg font-bold mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Time</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{stats.avgTimeOnPage}s</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-teal-500">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Max Scroll</p>
            <p className="text-3xl font-bold mt-2 text-teal-600">{stats.maxScrollDepth}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Conversions</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.conversions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-gray-400">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Page Load</p>
            <p className="text-3xl font-bold mt-2 text-gray-600">
              {stats.avgLoadTime > 0 ? `${(stats.avgLoadTime/1000).toFixed(1)}s` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Interaction & Intent Grid */}
      <div>
        <h3 className="text-lg font-bold mb-4">User Interactions & Intent</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Clicks</p>
              <span className="text-purple-500">👆</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.clicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Forms Started</p>
              <span className="text-orange-500">📝</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.formStarts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Form Submits</p>
              <span className="text-green-500">✅</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.formSubmits}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Phone Clicks</p>
              <span className="text-green-600">📞</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.phoneClicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Email Clicks</p>
              <span className="text-green-600">✉️</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.emailClicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Downloads</p>
              <span className="text-purple-600">📥</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.downloads}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Text Copies</p>
              <span className="text-blue-600">📋</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.copyEvents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition bg-red-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-500">Rage Clicks</p>
              <span className="text-red-500">😡</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.rageClicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition bg-yellow-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-yellow-700">Dead Clicks</p>
              <span className="text-yellow-600">⚠️</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-yellow-700">{stats.deadClicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition bg-orange-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-orange-700">JS Errors</p>
              <span className="text-orange-600">🐛</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-orange-700">{stats.jsErrors}</p>
          </div>
        </div>
      </div>

      {/* Conversion Intent Signals */}
      {(stats.phoneClicks > 0 || stats.emailClicks > 0 || stats.downloads > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">✅ Conversion Intent Detected</p>
          <div className="mt-2 space-y-1 text-sm text-green-700">
            {stats.phoneClicks > 0 && <p>• {stats.phoneClicks} phone clicks (ready to call)</p>}
            {stats.emailClicks > 0 && <p>• {stats.emailClicks} email clicks (ready to contact)</p>}
            {stats.downloads > 0 && <p>• {stats.downloads} downloads (high interest)</p>}
            {stats.copyEvents > 0 && <p>• {stats.copyEvents} text copies (finding value)</p>}
          </div>
        </div>
      )}

      {/* Performance Issues */}
      {(stats.avgLoadTime > 3000 || stats.jsErrors > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm font-medium text-orange-800">⚠️ Technical Issues</p>
          <div className="mt-2 space-y-1 text-sm text-orange-700">
            {stats.avgLoadTime > 3000 && <p>• Slow page load: {Math.round(stats.avgLoadTime/1000)}s (should be &lt;3s)</p>}
            {stats.jsErrors > 0 && <p>• {stats.jsErrors} JavaScript errors (breaking functionality)</p>}
          </div>
        </div>
      )}

      {/* Problem Indicators */}
      {(stats.rageClicks > 0 || stats.deadClicks > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">⚠️ User Frustration Detected</p>
          <div className="mt-2 space-y-1 text-sm text-red-700">
            {stats.rageClicks > 0 && <p>• {stats.rageClicks} rage clicks (users clicking frantically)</p>}
            {stats.deadClicks > 0 && <p>• {stats.deadClicks} dead clicks (clicking non-interactive elements)</p>}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {stats.totalEvents === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">🚀 Get Started - Add Tracking to Your Site</h3>
          <p className="text-sm text-gray-700 mb-4">
            Copy this script and paste it in the <code className="bg-white px-2 py-1 rounded">&lt;head&gt;</code> section of your website:
          </p>
          <div className="bg-white p-4 rounded border border-gray-300 font-mono text-sm break-all mb-4">
            {trackingScript}
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {copied ? '✓ Copied!' : 'Copy Script'}
          </button>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Track Clicks & Forms:</h4>
            <div className="space-y-2 text-sm">
              <p>• Add <code className="bg-gray-100 px-2 py-1 rounded">data-track="button-name"</code> to any button/link</p>
              <p>• Forms are auto-tracked (starts & submissions)</p>
              <p>• Call <code className="bg-gray-100 px-2 py-1 rounded">webAnalytics.conversion()</code> on purchase/signup</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Guide */}
      {stats.totalEvents > 0 && stats.clicks === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            💡 <strong>Track more conversions:</strong> Add <code className="bg-white px-2 py-1 rounded">data-track="cta-name"</code> to important buttons/links
          </p>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="font-bold text-lg">Recent Activity</h3>
        </div>
        <div className="p-6">
          {recentEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events yet. Add the tracking script to start collecting data!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Event</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">URL</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Session</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentEvents.map((event) => {
                    const eventColors: Record<string, string> = {
                      pageview: 'bg-blue-100 text-blue-800',
                      click: 'bg-purple-100 text-purple-800',
                      form_start: 'bg-orange-100 text-orange-800',
                      form_submit: 'bg-green-100 text-green-800',
                      conversion: 'bg-pink-100 text-pink-800',
                      rage_click: 'bg-red-100 text-red-800',
                      dead_click: 'bg-yellow-100 text-yellow-800',
                      scroll_depth: 'bg-teal-100 text-teal-800',
                      time_on_page: 'bg-indigo-100 text-indigo-800',
                      exit: 'bg-gray-100 text-gray-800',
                      performance: 'bg-cyan-100 text-cyan-800',
                      js_error: 'bg-red-200 text-red-900',
                      phone_click: 'bg-green-200 text-green-900',
                      email_click: 'bg-green-200 text-green-900',
                      download_click: 'bg-purple-200 text-purple-900',
                      copy_text: 'bg-blue-200 text-blue-900',
                      field_time: 'bg-orange-200 text-orange-900',
                      field_correction: 'bg-yellow-200 text-yellow-900',
                      idle: 'bg-gray-200 text-gray-900',
                      tab_return: 'bg-indigo-200 text-indigo-900'
                    };
                    
                    return (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <span className={`${eventColors[event.event_type] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs font-medium`}>
                            {event.event_type}
                          </span>
                          {event.data?.element && (
                            <span className="ml-2 text-xs text-gray-500">
                              {event.data.element}
                            </span>
                          )}
                          {event.data?.form && (
                            <span className="ml-2 text-xs text-gray-500">
                              {event.data.form}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">
                          {event.url}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                          {event.session_id.substring(0, 12)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

