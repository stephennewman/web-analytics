'use client';

interface Event {
  id: string;
  event_type: string;
  url: string;
  timestamp: string;
  data?: any;
}

export default function ClickPath({ events }: { events: Event[] }) {
  // Get only pageview events in chronological order
  const allPageviews = events
    .filter(e => e.event_type === 'pageview')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (allPageviews.length === 0) {
    return null;
  }

  // Remove duplicate consecutive pages (keep first occurrence of each unique URL)
  const pageviews: Event[] = [];
  const seenUrls = new Set<string>();
  
  allPageviews.forEach(pv => {
    if (!seenUrls.has(pv.url)) {
      seenUrls.add(pv.url);
      pageviews.push(pv);
    }
  });

  // Extract clean page names
  const getPageName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname === '/' ? 'Home' : urlObj.pathname.replace(/\//g, '');
      const hash = urlObj.hash ? urlObj.hash.replace('#', ' #') : '';
      return path + hash || 'Home';
    } catch {
      return url;
    }
  };

  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-600 mb-3">📍 CLICK PATH</h4>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {pageviews.map((pv, index) => (
          <div key={pv.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-lg text-xs font-medium text-purple-800 border border-purple-200 whitespace-nowrap">
              {index + 1}. {getPageName(pv.url)}
            </div>
            {index < pageviews.length - 1 && (
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {pageviews.length} {pageviews.length === 1 ? 'page' : 'pages'} visited
      </p>
    </div>
  );
}

