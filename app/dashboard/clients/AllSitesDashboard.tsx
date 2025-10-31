'use client';

import { useMemo } from 'react';
import { Card, Metric, ProgressBar, BarList } from '@tremor/react';
import { Badge } from '@/components/ui/badge';

interface AllSitesDashboardProps {
  sessions: any[];
  clients: any[];
  stats: any;
}

export default function AllSitesDashboard({ sessions, clients, stats }: AllSitesDashboardProps) {
  // Calculate per-site metrics
  const siteMetrics = useMemo(() => {
    return clients.map(client => {
      const siteSessions = sessions.filter(s => s.client_id === client.id);
      const converted = siteSessions.filter(s => s.converted).length;
      const intent = siteSessions.filter(s => s.hasIntent).length;
      const totalPageviews = siteSessions.reduce((sum, s) => sum + s.pageviews, 0);
      const totalClicks = siteSessions.reduce((sum, s) => sum + s.clicks, 0);
      const totalTime = siteSessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const avgTimePerSession = siteSessions.length > 0 ? Math.round(totalTime / siteSessions.length) : 0;
      const conversionRate = siteSessions.length > 0 ? ((converted / siteSessions.length) * 100).toFixed(1) : '0';
      
      return {
        id: client.id,
        name: client.name,
        domain: client.domain,
        sessions: siteSessions.length,
        converted,
        conversionRate: parseFloat(conversionRate),
        intent,
        pageviews: totalPageviews,
        clicks: totalClicks,
        avgTime: avgTimePerSession,
        health: calculateHealthScore(siteSessions.length, converted, intent)
      };
    }).filter(m => m.sessions > 0); // Only show sites with traffic
  }, [sessions, clients]);

  // Sort sites by different metrics
  const topBySessions = [...siteMetrics].sort((a, b) => b.sessions - a.sessions).slice(0, 5);
  const topByConversion = [...siteMetrics].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 5);
  const topByHealth = [...siteMetrics].sort((a, b) => b.health - a.health).slice(0, 5);

  // Calculate device & location distribution across all sites
  const deviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      const device = s.deviceType || 'unknown';
      counts[device] = (counts[device] || 0) + 1;
    });
    return Object.entries(counts).map(([device, count]) => ({
      device,
      count,
      percentage: ((count / sessions.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  }, [sessions]);

  const locationDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      const location = s.country || 'Unknown';
      counts[location] = (counts[location] || 0) + 1;
    });
    return Object.entries(counts).map(([location, count]) => ({
      location,
      count,
      percentage: ((count / sessions.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10 countries
  }, [sessions]);

  // Traffic sources
  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      const source = s.referrer === 'direct' ? 'Direct' : 
                     s.referrer?.includes('google') ? 'Google' :
                     s.referrer?.includes('facebook') ? 'Facebook' :
                     s.referrer?.includes('twitter') ? 'Twitter' :
                     s.referrer ? 'Other Referral' : 'Direct';
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts).map(([source, count]) => ({
      source,
      count,
      percentage: ((count / sessions.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            decoration="top" 
            decorationColor="purple"
            className="shadow-[4px_4px_0px_rgba(168,85,247,0.4)] border-2 border-purple-200 hover:shadow-[6px_6px_0px_rgba(168,85,247,0.5)] transition-all hover:-translate-y-1"
          >
            <Metric className="text-purple-600">{siteMetrics.length}</Metric>
            <p className="text-sm text-gray-600 mt-1 font-semibold">Total Sites</p>
            <p className="text-xs text-gray-500 mt-1">With traffic</p>
          </Card>
          <Card 
            decoration="top" 
            decorationColor="blue"
            className="shadow-[4px_4px_0px_rgba(59,130,246,0.4)] border-2 border-blue-200 hover:shadow-[6px_6px_0px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-1"
          >
            <Metric className="text-blue-600">{stats.totalSessions}</Metric>
            <p className="text-sm text-gray-600 mt-1 font-semibold">Total Sessions</p>
            <p className="text-xs text-gray-500 mt-1">All sites</p>
          </Card>
          <Card 
            decoration="top" 
            decorationColor="green"
            className="shadow-[4px_4px_0px_rgba(34,197,94,0.4)] border-2 border-green-200 hover:shadow-[6px_6px_0px_rgba(34,197,94,0.5)] transition-all hover:-translate-y-1"
          >
            <Metric className="text-green-600">{stats.conversionRate}%</Metric>
            <p className="text-sm text-gray-600 mt-1 font-semibold">Avg Conversion</p>
            <p className="text-xs text-gray-500 mt-1">{stats.convertedSessions} converted</p>
          </Card>
          <Card 
            decoration="top" 
            decorationColor="yellow"
            className="shadow-[4px_4px_0px_rgba(234,179,8,0.4)] border-2 border-yellow-200 hover:shadow-[6px_6px_0px_rgba(234,179,8,0.5)] transition-all hover:-translate-y-1"
          >
            <Metric className="text-yellow-600">{stats.sessionsWithIntent}</Metric>
            <p className="text-sm text-gray-600 mt-1 font-semibold">High Intent</p>
            <p className="text-xs text-gray-500 mt-1">Hot leads</p>
          </Card>
          <Card 
            decoration="top" 
            decorationColor="gray"
            className="shadow-[4px_4px_0px_rgba(0,0,0,0.2)] border-2 border-gray-200 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1"
          >
            <Metric className="text-gray-700">{stats.totalPageviews}</Metric>
            <p className="text-sm text-gray-600 mt-1 font-semibold">Total Pageviews</p>
            <p className="text-xs text-gray-500 mt-1">All sites</p>
          </Card>
        </div>
      </div>

      {/* Top Performing Sites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top by Traffic */}
        <Card className="shadow-[3px_3px_0px_rgba(0,0,0,0.15)] border-2 border-gray-200 hover:shadow-[5px_5px_0px_rgba(0,0,0,0.2)] transition-all">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔥</span> Top by Traffic
          </h3>
          <div className="space-y-3">
            {topBySessions.map((site, idx) => (
              <div key={site.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{site.name}</p>
                    <p className="text-xs text-gray-500">{site.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-600">{site.conversionRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top by Conversion */}
        <Card className="shadow-[3px_3px_0px_rgba(0,0,0,0.15)] border-2 border-gray-200 hover:shadow-[5px_5px_0px_rgba(0,0,0,0.2)] transition-all">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span> Top by Conversion
          </h3>
          <div className="space-y-3">
            {topByConversion.map((site, idx) => (
              <div key={site.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-green-100 text-green-700' :
                    idx === 1 ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{site.name}</p>
                    <p className="text-xs text-gray-500">{site.converted} converted</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{site.conversionRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top by Health */}
        <Card className="shadow-[3px_3px_0px_rgba(0,0,0,0.15)] border-2 border-gray-200 hover:shadow-[5px_5px_0px_rgba(0,0,0,0.2)] transition-all">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>❤️</span> Healthiest Sites
          </h3>
          <div className="space-y-3">
            {topByHealth.map((site, idx) => (
              <div key={site.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    site.health >= 80 ? 'bg-green-100 text-green-700' :
                    site.health >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{site.name}</p>
                    <p className="text-xs text-gray-500">{site.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    site.health >= 80 ? 'text-green-600' :
                    site.health >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{site.health}/100</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Health = Traffic × Conversion × Engagement
          </p>
        </Card>
      </div>

      {/* All Sites Performance Table */}
      <Card className="overflow-hidden p-0 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] border-2 border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">All Sites Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Site</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Sessions</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Conv. Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">High Intent</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Pageviews</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Avg Time</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {siteMetrics.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{site.name}</p>
                      {site.domain && <p className="text-xs text-gray-500">{site.domain}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{site.sessions}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      site.conversionRate >= 10 ? 'text-green-600' :
                      site.conversionRate >= 5 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {site.conversionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{site.intent}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{site.pageviews}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {Math.floor(site.avgTime / 60)}m {site.avgTime % 60}s
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            site.health >= 80 ? 'bg-green-500' :
                            site.health >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${site.health}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">{site.health}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribution Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Device Distribution</h3>
          <div className="space-y-3">
            {deviceDistribution.map((item) => (
              <div key={item.device}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{item.device}</span>
                  <span className="text-sm text-gray-500">{item.percentage}%</span>
                </div>
                <ProgressBar value={Number(item.percentage)} color="purple" className="mt-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Location Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">🌍 Top Locations</h3>
          <div className="space-y-2">
            {locationDistribution.map((item) => (
              <div key={item.location} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.location}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.count}</span>
                  <span className="text-xs font-semibold text-purple-600">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Traffic Sources</h3>
          <div className="space-y-3">
            {sourceDistribution.map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.source}</span>
                  <span className="text-sm text-gray-500">{item.percentage}%</span>
                </div>
                <ProgressBar value={Number(item.percentage)} color="blue" className="mt-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper function to calculate health score
function calculateHealthScore(sessions: number, converted: number, intent: number): number {
  if (sessions === 0) return 0;
  
  // Weighted formula:
  // - Traffic volume (up to 100 sessions = 40 points)
  // - Conversion rate (up to 20% = 40 points)
  // - Intent rate (up to 50% = 20 points)
  
  const trafficScore = Math.min(40, (sessions / 100) * 40);
  const conversionScore = Math.min(40, ((converted / sessions) * 100 / 20) * 40);
  const intentScore = Math.min(20, ((intent / sessions) * 100 / 50) * 20);
  
  return Math.round(trafficScore + conversionScore + intentScore);
}

