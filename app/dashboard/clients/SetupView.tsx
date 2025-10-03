'use client';

import { useState } from 'react';
import SessionFeed from './SessionFeed';

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

export default function SetupView({ 
  client, 
  sessions,
  stats
}: { 
  client: Client;
  sessions: any[];
  stats: Stats;
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-6">Live Session Feed</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-blue-100 text-sm">Total Sessions</p>
            <p className="text-4xl font-bold mt-2">{stats.totalSessions}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Pageviews</p>
            <p className="text-4xl font-bold mt-2">{stats.totalPageviews}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Conversion Rate</p>
            <p className="text-4xl font-bold mt-2">{stats.conversionRate}%</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">High Intent</p>
            <p className="text-4xl font-bold mt-2 text-green-300">{stats.sessionsWithIntent}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">UX Issues</p>
            <p className="text-4xl font-bold mt-2 text-yellow-300">{stats.sessionsWithFrustration}</p>
          </div>
        </div>
      </div>

      {/* Session Feed */}
      {sessions.length === 0 ? (
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
        </div>
      ) : (
        <SessionFeed sessions={sessions} />
      )}



    </div>
  );
}

