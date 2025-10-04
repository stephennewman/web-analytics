'use client';

interface Session {
  converted: boolean;
  deviceType: string;
  city?: string;
  region?: string;
  country?: string;
  scrollDepth: number;
  timeSpent: number;
  pageviews: number;
}

export default function DeviceLocationInsights({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  // Device performance
  const deviceStats: Record<string, { total: number; converted: number; avgTime: number; avgPages: number }> = {};
  
  sessions.forEach(s => {
    const device = s.deviceType || 'unknown';
    if (!deviceStats[device]) {
      deviceStats[device] = { total: 0, converted: 0, avgTime: 0, avgPages: 0 };
    }
    deviceStats[device].total++;
    if (s.converted) deviceStats[device].converted++;
    deviceStats[device].avgTime += s.timeSpent;
    deviceStats[device].avgPages += s.pageviews;
  });

  // Calculate averages and conversion rates
  const deviceInsights = Object.entries(deviceStats).map(([device, stats]) => ({
    device,
    total: stats.total,
    conversionRate: (stats.converted / stats.total) * 100,
    avgTime: Math.round(stats.avgTime / stats.total),
    avgPages: (stats.avgPages / stats.total).toFixed(1),
  })).sort((a, b) => b.total - a.total);

  // Location performance (regions/cities)
  const locationStats: Record<string, { total: number; converted: number }> = {};
  
  sessions.forEach(s => {
    const location = s.city && s.region 
      ? `${s.city}, ${s.region}` 
      : s.region || s.country || 'Unknown';
    
    if (!locationStats[location]) {
      locationStats[location] = { total: 0, converted: 0 };
    }
    locationStats[location].total++;
    if (s.converted) locationStats[location].converted++;
  });

  const locationInsights = Object.entries(locationStats)
    .map(([location, stats]) => ({
      location,
      total: stats.total,
      conversionRate: (stats.converted / stats.total) * 100,
    }))
    .filter(l => l.total >= 2) // Only show locations with 2+ visits
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5);

  const bestDevice = deviceInsights.reduce((best, curr) => 
    curr.conversionRate > best.conversionRate ? curr : best
  , deviceInsights[0]);

  const bestLocation = locationInsights.length > 0 ? locationInsights[0] : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">📱 Device & Location Intel</h3>
      
      {/* Device Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">By Device Type:</h4>
        <div className="space-y-2">
          {deviceInsights.map(d => (
            <div key={d.device} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {d.device === 'mobile' ? '📱' : d.device === 'tablet' ? '📱' : '💻'}
                </span>
                <div>
                  <p className="font-medium text-sm text-gray-800 capitalize">{d.device}</p>
                  <p className="text-xs text-gray-500">
                    {d.avgPages} pages • {d.avgTime}s avg time
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-700">{d.total} sessions</p>
                <p className={`text-xs font-semibold ${
                  d.conversionRate > 0 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {d.conversionRate.toFixed(0)}% convert
                </p>
              </div>
            </div>
          ))}
        </div>

        {bestDevice && bestDevice.conversionRate > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-900">
              💡 <strong>Optimize for {bestDevice.device}</strong> - your highest converting device type!
            </p>
          </div>
        )}
      </div>

      {/* Location Breakdown */}
      {locationInsights.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">By Location:</h4>
          <div className="space-y-2">
            {locationInsights.map((loc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌍</span>
                  <span className="text-sm font-medium text-gray-800">{loc.location}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{loc.total} visits</p>
                  <p className={`text-xs font-semibold ${
                    loc.conversionRate > 0 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {loc.conversionRate.toFixed(0)}% convert
                  </p>
                </div>
              </div>
            ))}
          </div>

          {bestLocation && bestLocation.conversionRate > 20 && (
            <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="text-sm text-green-900">
                🎯 <strong>{bestLocation.location}</strong> has {bestLocation.conversionRate.toFixed(0)}% conversion rate!
                Consider geo-targeted ads here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

