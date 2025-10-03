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
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Pageviews</p>
          <p className="text-3xl font-bold mt-2">{stats.pageviews}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Unique Sessions</p>
          <p className="text-3xl font-bold mt-2">{stats.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-3xl font-bold mt-2">{stats.conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.convertedSessions} of {stats.totalSessions} sessions
          </p>
        </div>
      </div>

      {/* Event Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600">Clicks Tracked</p>
          <p className="text-2xl font-bold mt-1">{stats.clicks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600">Form Starts</p>
          <p className="text-2xl font-bold mt-1">{stats.formStarts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600">Form Submits</p>
          <p className="text-2xl font-bold mt-1">{stats.formSubmits}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600">Conversions</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.conversions}</p>
        </div>
      </div>

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
                      conversion: 'bg-pink-100 text-pink-800'
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

