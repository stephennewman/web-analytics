'use client';

interface Event {
  id: string;
  event_type: string;
  url: string;
  timestamp: string;
  data?: any;
}

interface Session {
  converted: boolean;
  events: Event[];
}

export default function NavigationFlow({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  // Build flow: Page A → Page B (count)
  const flows: Record<string, { to: Record<string, number>, converted: number }> = {};

  sessions.forEach(session => {
    const pageviews = session.events
      .filter(e => e.event_type === 'pageview')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (let i = 0; i < pageviews.length - 1; i++) {
      const from = getPageName(pageviews[i].url);
      const to = getPageName(pageviews[i + 1].url);

      if (!flows[from]) flows[from] = { to: {}, converted: 0 };
      if (!flows[from].to[to]) flows[from].to[to] = 0;
      
      flows[from].to[to]++;
      if (session.converted) flows[from].converted++;
    }
  });

  // Get most common flows
  const topFlows: Array<{ from: string; to: string; count: number; conversionRate: number }> = [];
  
  Object.entries(flows).forEach(([from, data]) => {
    Object.entries(data.to).forEach(([to, count]) => {
      const convRate = data.converted > 0 ? ((data.converted / count) * 100) : 0;
      topFlows.push({ from, to, count, conversionRate: convRate });
    });
  });

  topFlows.sort((a, b) => b.count - a.count);
  const displayFlows = topFlows.slice(0, 8);

  if (displayFlows.length === 0) return null;

  const maxCount = Math.max(...displayFlows.map(f => f.count));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">🗺️ Navigation Flow</h3>
      <p className="text-sm text-gray-600 mb-4">Most common paths visitors take</p>
      
      <div className="space-y-3">
        {displayFlows.map((flow, idx) => {
          const width = (flow.count / maxCount) * 100;
          const isHighConversion = flow.conversionRate > 20;
          
          return (
            <div key={idx} className="relative">
              <div 
                className={`absolute inset-0 rounded ${
                  isHighConversion 
                    ? 'bg-gradient-to-r from-green-100 to-green-200' 
                    : 'bg-gradient-to-r from-blue-100 to-purple-100'
                }`}
                style={{ width: `${width}%` }}
              />
              <div className="relative px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-700 font-medium text-sm truncate">
                    {flow.from}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700 font-medium text-sm truncate">
                    {flow.to}
                  </span>
                  {isHighConversion && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">
                      🔥 HOT PATH
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm font-bold text-gray-700">
                    {flow.count} users
                  </span>
                  {flow.conversionRate > 0 && (
                    <span className="text-xs text-green-600 font-semibold">
                      {flow.conversionRate.toFixed(0)}% convert
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPageName(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hash) return urlObj.hash.replace('#', '') || 'Home';
    if (urlObj.pathname === '/') return 'Home';
    return urlObj.pathname.split('/').filter(Boolean).join('/') || 'Home';
  } catch {
    return url;
  }
}

