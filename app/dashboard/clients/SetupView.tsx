'use client';

import { useState } from 'react';
import SessionFeed from './SessionFeed';
import InsightsPanel from './InsightsPanel';
import NavigationFlow from './NavigationFlow';
import BestPath from './BestPath';
import DeviceLocationInsights from './DeviceLocationInsights';
import TimeOfDayHeatmap from './TimeOfDayHeatmap';
import ExitAnalysis from './ExitAnalysis';
import ScrollEngagement from './ScrollEngagement';

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
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">✨ Your Visitor Stories</h2>
        <p className="text-purple-100 text-sm mb-6">Every click tells a tale of curiosity and engagement!</p>
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
            <p className="text-blue-100 text-sm">Curious Explorers</p>
            <p className="text-4xl font-bold mt-2 text-cyan-300">{stats.sessionsWithFrustration}</p>
          </div>
        </div>
      </div>

      {/* Session Feed */}
      {sessions.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-8 border border-purple-200">
          <h3 className="font-bold text-2xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">✨ Your Analytics Adventure Starts Here!</h3>
          <p className="text-gray-700 mb-4 text-lg">
            Add this magical tracking script and watch your visitor stories unfold! 🎨
          </p>
          <div className="bg-white p-4 rounded-lg border-2 border-purple-300 font-mono text-sm break-all mb-4 shadow-sm">
            {trackingScript}
          </div>
          <button
            onClick={copyToClipboard}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-xl font-medium shadow-md transition transform hover:scale-105"
          >
            {copied ? '✨ Copied!' : '🚀 Copy Tracking Script'}
          </button>
          <p className="mt-4 text-sm text-gray-600">
            Every visitor is a story waiting to be told! 💫
          </p>
        </div>
      ) : (
        <>
          <InsightsPanel sessions={sessions} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BestPath sessions={sessions} />
            <NavigationFlow sessions={sessions} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DeviceLocationInsights sessions={sessions} />
            <TimeOfDayHeatmap sessions={sessions} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ScrollEngagement sessions={sessions} />
            <ExitAnalysis sessions={sessions} />
          </div>
          <SessionFeed sessions={sessions} />
        </>
      )}
    </div>
  );
}

