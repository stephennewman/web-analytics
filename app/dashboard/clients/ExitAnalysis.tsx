'use client';

interface Session {
  exit_url: string | null;
  converted: boolean;
  scrollDepth: number;
  timeSpent: number;
  activeTime: number;
  events: any[];
}

export default function ExitAnalysis({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  // Analyze exit pages
  const exitPages: Record<string, { count: number; avgScroll: number; avgTime: number; bounces: number }> = {};

  sessions.forEach(s => {
    const exitEvent = s.events.find(e => e.event_type === 'exit');
    const exitUrl = exitEvent?.url || s.exit_url;
    
    if (!exitUrl) return;
    
    const pageName = getPageName(exitUrl);
    
    if (!exitPages[pageName]) {
      exitPages[pageName] = { count: 0, avgScroll: 0, avgTime: 0, bounces: 0 };
    }
    
    exitPages[pageName].count++;
    exitPages[pageName].avgScroll += s.scrollDepth;
    exitPages[pageName].avgTime += s.activeTime;
    
    // Bounce = only 1 pageview and low engagement
    if (s.events.filter(e => e.event_type === 'pageview').length === 1 && s.scrollDepth < 25) {
      exitPages[pageName].bounces++;
    }
  });

  // Calculate averages
  const exitInsights = Object.entries(exitPages).map(([page, data]) => ({
    page,
    count: data.count,
    avgScroll: Math.round(data.avgScroll / data.count),
    avgTime: Math.round(data.avgTime / data.count),
    bounceRate: (data.bounces / data.count) * 100,
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 6);

  if (exitInsights.length === 0) return null;

  const worstPage = exitInsights.reduce((worst, curr) => 
    curr.bounceRate > worst.bounceRate ? curr : worst
  , exitInsights[0]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">🚪 Exit Page Analysis</h3>
      <p className="text-sm text-gray-600 mb-4">Where visitors leave your site</p>
      
      <div className="space-y-3">
        {exitInsights.map((exit, idx) => {
          const isProblematic = exit.bounceRate > 50 || exit.avgScroll < 25;
          
          return (
            <div 
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                isProblematic 
                  ? 'bg-red-50 border-red-400' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 text-sm flex-1 truncate">
                  {exit.page}
                </span>
                <span className="text-sm font-bold text-gray-700 ml-2">
                  {exit.count} exits
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Avg Scroll</p>
                  <p className={`font-semibold ${
                    exit.avgScroll < 25 ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {exit.avgScroll}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Time</p>
                  <p className="font-semibold text-gray-700">{exit.avgTime}s</p>
                </div>
                <div>
                  <p className="text-gray-500">Bounce Rate</p>
                  <p className={`font-semibold ${
                    exit.bounceRate > 50 ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {exit.bounceRate.toFixed(0)}%
                  </p>
                </div>
              </div>

              {isProblematic && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-xs text-red-700">
                    ⚠️ <strong>Issue detected:</strong> {
                      exit.bounceRate > 50 
                        ? 'High bounce rate - improve first impression' 
                        : 'Low scroll depth - add engaging content above the fold'
                    }
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {worstPage.bounceRate > 60 && (
        <div className="mt-4 p-4 bg-orange-100 rounded-lg border-l-4 border-orange-500">
          <p className="text-sm font-semibold text-orange-900">🔧 Priority Fix:</p>
          <p className="text-xs text-orange-800 mt-1">
            <strong>{worstPage.page}</strong> has a {worstPage.bounceRate.toFixed(0)}% bounce rate.
            Test: different headlines, add video, improve load speed, or add trust signals.
          </p>
        </div>
      )}
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

