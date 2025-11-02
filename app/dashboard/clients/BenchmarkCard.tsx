'use client';

import { Card } from '@tremor/react';

interface BenchmarkCardProps {
  client: any;
  currentStats: {
    conversions: number;
    sessions: number;
    uniqueVisitors: number;
  };
}

export default function BenchmarkCard({ client, currentStats }: BenchmarkCardProps) {
  // Only show if benchmarks are configured
  if (!client.benchmark_monthly_conversions && !client.benchmark_monthly_sessions) {
    return null;
  }

  const calculatePercentageChange = (current: number, benchmark: number) => {
    if (!benchmark || benchmark === 0) return '0';
    return ((current / benchmark) * 100 - 100).toFixed(0);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const conversionsChange = client.benchmark_monthly_conversions 
    ? calculatePercentageChange(currentStats.conversions, client.benchmark_monthly_conversions)
    : null;
  
  const sessionsChange = client.benchmark_monthly_sessions
    ? calculatePercentageChange(currentStats.sessions, client.benchmark_monthly_sessions)
    : null;
  
  const visitorsChange = client.benchmark_monthly_visitors
    ? calculatePercentageChange(currentStats.uniqueVisitors, client.benchmark_monthly_visitors)
    : null;

  return (
    <Card 
      decoration="top" 
      decorationColor="amber"
      className="shadow-[4px_4px_0px_rgba(245,158,11,0.4)] border-2 border-amber-200"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📊 Historical Benchmarks
          </h3>
          <span className="text-xs text-gray-500">{client.benchmark_period || '12 months'} avg</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Conversions */}
          {client.benchmark_monthly_conversions && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="text-xs text-gray-600 mb-1">Conversions</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{currentStats.conversions}</span>
                <span className="text-xs text-gray-500">/ {client.benchmark_monthly_conversions}</span>
              </div>
              {conversionsChange !== null && (
                <div className={`text-xs font-semibold mt-1 ${getChangeColor(parseFloat(conversionsChange))}`}>
                  {getChangeIcon(parseFloat(conversionsChange))} {parseFloat(conversionsChange) > 0 ? '+' : ''}{conversionsChange}% vs avg
                </div>
              )}
            </div>
          )}

          {/* Sessions */}
          {client.benchmark_monthly_sessions && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-gray-600 mb-1">Sessions</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{currentStats.sessions}</span>
                <span className="text-xs text-gray-500">/ {client.benchmark_monthly_sessions}</span>
              </div>
              {sessionsChange !== null && (
                <div className={`text-xs font-semibold mt-1 ${getChangeColor(parseFloat(sessionsChange))}`}>
                  {getChangeIcon(parseFloat(sessionsChange))} {parseFloat(sessionsChange) > 0 ? '+' : ''}{sessionsChange}% vs avg
                </div>
              )}
            </div>
          )}

          {/* Unique Visitors */}
          {client.benchmark_monthly_visitors && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-xs text-gray-600 mb-1">Unique Visitors</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{currentStats.uniqueVisitors}</span>
                <span className="text-xs text-gray-500">/ {client.benchmark_monthly_visitors}</span>
              </div>
              {visitorsChange !== null && (
                <div className={`text-xs font-semibold mt-1 ${getChangeColor(parseFloat(visitorsChange))}`}>
                  {getChangeIcon(parseFloat(visitorsChange))} {parseFloat(visitorsChange) > 0 ? '+' : ''}{visitorsChange}% vs avg
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 border-t border-gray-200 pt-2">
          Comparing current month's performance against {client.benchmark_period || '12-month'} historical average
        </p>
      </div>
    </Card>
  );
}

