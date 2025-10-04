'use client';

interface Session {
  id: string;
  converted: boolean;
  pageviews: number;
  clicks: number;
  timeSpent: number;
  activeTime: number;
  loadTime: number;
  scrollDepth: number;
  hasIntent: boolean;
  hasFrustration: boolean;
  events: any[];
}

export default function InsightsPanel({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span>
          AI Insights
        </h3>
        <p className="text-sm text-gray-500">
          AI insights will appear here once you have visitor data to analyze.
        </p>
      </div>
    );
  }

  // 1. Performance insight
  const avgLoadTime = sessions
    .filter(s => s.loadTime > 0)
    .reduce((sum, s) => sum + s.loadTime, 0) / sessions.filter(s => s.loadTime > 0).length;
  
  const slowSessions = sessions.filter(s => s.loadTime > 3000).length;
  
  // 2. Engagement drop-off
  const bouncers = sessions.filter(s => s.pageviews === 1 && s.scrollDepth < 25).length;
  const bounceRate = ((bouncers / sessions.length) * 100).toFixed(0);
  
  // 3. "Almost converted" - high intent but didn't convert
  const almostConverted = sessions.filter(s => !s.converted && s.hasIntent).length;
  
  // 4. Returning visitors (tab_return events)
  const returningVisitors = sessions.filter(s => 
    s.events.some(e => e.event_type === 'tab_return')
  ).length;
  
  // 5. Deep engagement (scrolled to 100% on multiple pages)
  const deepEngagement = sessions.filter(s => 
    s.scrollDepth === 100 && s.pageviews >= 3
  ).length;
  
  // 6. Performance vs conversion correlation
  const fastLoadConverted = sessions.filter(s => s.loadTime < 2000 && s.converted).length;
  const slowLoadConverted = sessions.filter(s => s.loadTime > 3000 && s.converted).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">💡</span>
        AI Insights
      </h3>
      
      <div className="space-y-3">
        {/* Performance Alert */}
        {avgLoadTime > 2000 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🐌</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-1">Speed Alert</h4>
                <p className="text-sm text-orange-800 leading-relaxed">
                  Average load time is <strong>{(avgLoadTime / 1000).toFixed(2)}s</strong>.
                  {slowSessions > 0 && ` ${slowSessions} sessions saw 3s+ load times.`}
                  <br />
                  <span className="text-orange-600 mt-1 inline-block">Every 1s delay = 7% fewer conversions.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bounce Rate Alert */}
        {parseInt(bounceRate) > 40 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🚪</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">High Bounce Rate</h4>
                <p className="text-sm text-red-800 leading-relaxed">
                  <strong>{bounceRate}%</strong> of visitors leave without scrolling or clicking.
                  <br />
                  <span className="text-red-600 mt-1 inline-block">Fix: Improve above-the-fold content, add compelling headlines.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Almost Converted */}
        {almostConverted > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎯</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">So Close!</h4>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  <strong>{almostConverted} visitors</strong> showed high intent (clicked phone/email/forms) but didn't convert.
                  <br />
                  <span className="text-yellow-700 mt-1 inline-block">Fix: Add urgency, social proof, or remove friction in your forms.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Returning Visitors */}
        {returningVisitors > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🔁</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">Returning Interest</h4>
                <p className="text-sm text-green-800 leading-relaxed">
                  <strong>{returningVisitors} visitors</strong> came back to your tab after browsing elsewhere.
                  <br />
                  <span className="text-green-700 mt-1 inline-block">This is high-intent behavior - they're comparing options!</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deep Engagement */}
        {deepEngagement > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📚</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-1">Deep Readers</h4>
                <p className="text-sm text-purple-800 leading-relaxed">
                  <strong>{deepEngagement} visitors</strong> scrolled to 100% on multiple pages.
                  <br />
                  <span className="text-purple-700 mt-1 inline-block">They're highly engaged - perfect for retargeting!</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance vs Conversion */}
        {(fastLoadConverted > 0 || slowLoadConverted > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⚡</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Speed = Money</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Fast loading pages (&lt;2s): <strong>{fastLoadConverted} conversions</strong>
                  <br />
                  Slow loading pages (&gt;3s): <strong>{slowLoadConverted} conversions</strong>
                  <br />
                  <span className="text-blue-700 mt-1 inline-block">Optimize images, use a CDN, minimize JavaScript.</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

