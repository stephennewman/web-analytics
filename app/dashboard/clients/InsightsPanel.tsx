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
  if (sessions.length === 0) return null;

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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        💡 AI Insights
      </h3>
      
      <div className="space-y-4">
        {/* Performance Alert */}
        {avgLoadTime > 2000 && (
          <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🐌</span>
              <h4 className="font-bold text-orange-900">Speed Alert</h4>
            </div>
            <p className="text-sm text-orange-800">
              Average load time is <strong>{(avgLoadTime / 1000).toFixed(2)}s</strong>.
              {slowSessions > 0 && ` ${slowSessions} sessions saw 3s+ load times.`}
              <br />
              💡 <strong>Every 1s delay = 7% fewer conversions.</strong>
            </p>
          </div>
        )}

        {/* Bounce Rate Alert */}
        {parseInt(bounceRate) > 40 && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚪</span>
              <h4 className="font-bold text-red-900">High Bounce Rate</h4>
            </div>
            <p className="text-sm text-red-800">
              <strong>{bounceRate}%</strong> of visitors leave without scrolling or clicking.
              <br />
              💡 <strong>Fix:</strong> Improve above-the-fold content, add compelling headlines.
            </p>
          </div>
        )}

        {/* Almost Converted */}
        {almostConverted > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎯</span>
              <h4 className="font-bold text-yellow-900">So Close!</h4>
            </div>
            <p className="text-sm text-yellow-800">
              <strong>{almostConverted} visitors</strong> showed high intent (clicked phone/email/forms) but didn't convert.
              <br />
              💡 <strong>Fix:</strong> Add urgency, social proof, or remove friction in your forms.
            </p>
          </div>
        )}

        {/* Returning Visitors */}
        {returningVisitors > 0 && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔁</span>
              <h4 className="font-bold text-green-900">Returning Interest</h4>
            </div>
            <p className="text-sm text-green-800">
              <strong>{returningVisitors} visitors</strong> came back to your tab after browsing elsewhere.
              <br />
              💡 This is <strong>high-intent behavior</strong> - they're comparing options!
            </p>
          </div>
        )}

        {/* Deep Engagement */}
        {deepEngagement > 0 && (
          <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📚</span>
              <h4 className="font-bold text-purple-900">Deep Readers</h4>
            </div>
            <p className="text-sm text-purple-800">
              <strong>{deepEngagement} visitors</strong> scrolled to 100% on multiple pages.
              <br />
              💡 They're <strong>highly engaged</strong> - perfect for retargeting!
            </p>
          </div>
        )}

        {/* Performance vs Conversion */}
        {(fastLoadConverted > 0 || slowLoadConverted > 0) && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⚡</span>
              <h4 className="font-bold text-blue-900">Speed = Money</h4>
            </div>
            <p className="text-sm text-blue-800">
              Fast loading pages (&lt;2s): <strong>{fastLoadConverted} conversions</strong>
              <br />
              Slow loading pages (&gt;3s): <strong>{slowLoadConverted} conversions</strong>
              <br />
              💡 <strong>Optimize images, use a CDN, minimize JavaScript.</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

