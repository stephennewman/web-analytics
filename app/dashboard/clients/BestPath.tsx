'use client';

interface Session {
  converted: boolean;
  events: any[];
  pageviews: number;
}

export default function BestPath({ sessions }: { sessions: Session[] }) {
  const convertedSessions = sessions.filter(s => s.converted);
  const nonConvertedSessions = sessions.filter(s => !s.converted);

  if (convertedSessions.length === 0) return null;

  // Analyze converted sessions for common patterns
  const convertedPaths = convertedSessions.map(s => {
    const pageviews = s.events
      .filter(e => e.event_type === 'pageview')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(e => getPageName(e.url));
    return [...new Set(pageviews)]; // unique pages only
  });

  // Find common pages in converted paths
  const pageFrequency: Record<string, number> = {};
  convertedPaths.forEach(path => {
    path.forEach(page => {
      pageFrequency[page] = (pageFrequency[page] || 0) + 1;
    });
  });

  // Calculate how often each page appears in converted vs non-converted
  const nonConvertedPages: Record<string, number> = {};
  nonConvertedSessions.forEach(s => {
    const pages = s.events
      .filter(e => e.event_type === 'pageview')
      .map(e => getPageName(e.url));
    [...new Set(pages)].forEach(page => {
      nonConvertedPages[page] = (nonConvertedPages[page] || 0) + 1;
    });
  });

  // Find "winning" pages (higher in converted than non-converted)
  const winningPages = Object.entries(pageFrequency)
    .map(([page, convCount]) => {
      const nonConvCount = nonConvertedPages[page] || 0;
      const convRate = (convCount / convertedSessions.length) * 100;
      const nonConvRate = nonConvertedSessions.length > 0 
        ? (nonConvCount / nonConvertedSessions.length) * 100 
        : 0;
      const lift = convRate - nonConvRate;
      
      return { page, convRate, nonConvRate, lift, count: convCount };
    })
    .filter(p => p.lift > 10) // Only show pages with meaningful lift
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 5);

  if (winningPages.length === 0) return null;

  // Find ideal page order
  const avgPathLength = convertedPaths.reduce((sum, p) => sum + p.length, 0) / convertedPaths.length;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-green-200">
      <h3 className="text-lg font-bold mb-2 text-green-800">🏆 Winning Formula</h3>
      <p className="text-sm text-green-700 mb-4">
        Converted visitors view <strong>{avgPathLength.toFixed(1)} pages</strong> on average
      </p>
      
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Pages that drive conversions:</h4>
        {winningPages.map((page, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800 text-sm">
                {idx + 1}. {page.page}
              </span>
              <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-bold">
                +{page.lift.toFixed(0)}% lift
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>✅ {page.convRate.toFixed(0)}% of converters see this</span>
              <span>❌ {page.nonConvRate.toFixed(0)}% of non-converters</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-green-100 rounded-lg">
        <p className="text-sm font-semibold text-green-900">💡 Action Item:</p>
        <p className="text-xs text-green-800 mt-1">
          Make sure these high-value pages are easy to find in your navigation. Consider adding CTAs to guide visitors through this winning path.
        </p>
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

