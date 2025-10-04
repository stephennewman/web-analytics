'use client';

interface Event {
  id: string;
  event_type: string;
  url: string;
  timestamp: string;
  data?: any;
}

export default function ClickAnalysis({ events }: { events: Event[] }) {
  // Get all click events
  const clickEvents = events.filter(e => e.event_type === 'click');
  
  if (clickEvents.length === 0) {
    return null;
  }

  // Aggregate clicks by button text
  const clickCounts: Record<string, { count: number; href: string | null; tag: string }> = {};
  
  clickEvents.forEach(click => {
    const text = click.data?.text || 'Unknown';
    const href = click.data?.href || null;
    const tag = click.data?.tag || 'unknown';
    
    if (!clickCounts[text]) {
      clickCounts[text] = { count: 0, href, tag };
    }
    clickCounts[text].count++;
  });

  // Sort by most clicked
  const sortedClicks = Object.entries(clickCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10); // Top 10

  if (sortedClicks.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-600 mb-3">🔥 BUTTON CLICKS (Heatmap)</h4>
      <div className="space-y-2">
        {sortedClicks.map(([text, data]) => {
          const percentage = (data.count / clickEvents.length) * 100;
          const emoji = data.tag === 'button' ? '🔘' : '🔗';
          
          return (
            <div key={text} className="relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span>{emoji}</span>
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {text}
                  </span>
                  {data.href && (
                    <span className="text-xs text-gray-500 truncate max-w-xs">
                      → {new URL(data.href).pathname}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-purple-700 ml-2">
                  {data.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {clickEvents.length} total clicks across {sortedClicks.length} buttons/links
      </p>
    </div>
  );
}

