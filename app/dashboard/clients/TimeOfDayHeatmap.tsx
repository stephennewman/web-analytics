'use client';

interface Session {
  created_at: string;
  converted: boolean;
}

export default function TimeOfDayHeatmap({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  // Analyze sessions by hour
  const hourlyData: Record<number, { total: number; converted: number }> = {};
  
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { total: 0, converted: 0 };
  }

  sessions.forEach(s => {
    const hour = new Date(s.created_at).getHours();
    hourlyData[hour].total++;
    if (s.converted) hourlyData[hour].converted++;
  });

  const hourlyInsights = Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    total: data.total,
    converted: data.converted,
    conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
  }));

  const maxTraffic = Math.max(...hourlyInsights.map(h => h.total));
  const bestHour = hourlyInsights.reduce((best, curr) => 
    curr.conversionRate > best.conversionRate && curr.total > 0 ? curr : best
  , hourlyInsights[0]);

  const peakHours = hourlyInsights
    .filter(h => h.total >= maxTraffic * 0.5)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Day/Night performance
  const dayHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const nightHours = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];

  const dayStats = hourlyInsights
    .filter(h => dayHours.includes(h.hour))
    .reduce((acc, h) => ({ total: acc.total + h.total, converted: acc.converted + h.converted }), 
      { total: 0, converted: 0 });

  const nightStats = hourlyInsights
    .filter(h => nightHours.includes(h.hour))
    .reduce((acc, h) => ({ total: acc.total + h.total, converted: acc.converted + h.converted }), 
      { total: 0, converted: 0 });

  const dayConvRate = dayStats.total > 0 ? (dayStats.converted / dayStats.total) * 100 : 0;
  const nightConvRate = nightStats.total > 0 ? (nightStats.converted / nightStats.total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">⏰ Time-of-Day Patterns</h3>
      
      {/* Day vs Night */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☀️</span>
            <h4 className="font-semibold text-gray-800">Daytime</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{dayStats.total}</p>
          <p className="text-xs text-gray-600">visits (6am-6pm)</p>
          {dayConvRate > 0 && (
            <p className="text-sm text-green-600 font-semibold mt-1">
              {dayConvRate.toFixed(0)}% convert
            </p>
          )}
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌙</span>
            <h4 className="font-semibold text-gray-800">Nighttime</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{nightStats.total}</p>
          <p className="text-xs text-gray-600">visits (6pm-6am)</p>
          {nightConvRate > 0 && (
            <p className="text-sm text-green-600 font-semibold mt-1">
              {nightConvRate.toFixed(0)}% convert
            </p>
          )}
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Hourly Traffic:</h4>
        <div className="grid grid-cols-12 gap-1">
          {hourlyInsights.map(h => {
            const intensity = h.total > 0 ? (h.total / maxTraffic) * 100 : 0;
            const isHot = h.conversionRate > 20 && h.total > 0;
            
            return (
              <div key={h.hour} className="text-center">
                <div 
                  className={`h-12 rounded flex items-end justify-center text-xs font-bold ${
                    isHot 
                      ? 'bg-green-500 text-white' 
                      : intensity > 50 
                        ? 'bg-blue-400 text-white' 
                        : intensity > 20 
                          ? 'bg-blue-200 text-gray-700'
                          : 'bg-gray-100 text-gray-400'
                  }`}
                  title={`${h.hour}:00 - ${h.total} visits, ${h.conversionRate.toFixed(0)}% convert`}
                >
                  <span className="pb-1">{h.total}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {bestHour.total > 0 && bestHour.conversionRate > 0 && (
          <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
            <p className="text-sm text-green-900">
              🔥 <strong>Best hour: {formatHour(bestHour.hour)}</strong> - {bestHour.conversionRate.toFixed(0)}% conversion rate
            </p>
          </div>
        )}

        {peakHours.length > 0 && (
          <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-900">
              📈 <strong>Peak traffic:</strong> {peakHours.map(h => formatHour(h.hour)).join(', ')}
            </p>
            <p className="text-xs text-blue-800 mt-1">
              💡 Schedule ads or promotions during these hours for maximum reach
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}

