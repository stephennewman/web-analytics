'use client';

interface Session {
  converted: boolean;
  scrollDepth: number;
  timeSpent: number;
  activeTime: number;
  events: any[];
}

export default function ScrollEngagement({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  // Analyze scroll patterns
  const scrollPatterns: Array<{ 
    sessionId: string;
    pattern: 'reader' | 'scanner' | 'bouncer';
    converted: boolean;
    scrollDepth: number;
  }> = [];

  sessions.forEach(s => {
    const scrollEvents = s.events
      .filter(e => e.event_type === 'scroll_depth')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(e => e.data?.depth || 0);

    if (scrollEvents.length === 0) {
      scrollPatterns.push({
        sessionId: s.events[0]?.session_id || '',
        pattern: 'bouncer',
        converted: s.converted,
        scrollDepth: s.scrollDepth,
      });
      return;
    }

    // Reader: scrolls sequentially (25 → 50 → 75 → 100)
    const isSequential = scrollEvents.every((depth, idx) => 
      idx === 0 || depth >= scrollEvents[idx - 1]
    );

    // Scanner: jumps around or skips milestones
    const hasJumps = scrollEvents.some((depth, idx) => 
      idx > 0 && depth > scrollEvents[idx - 1] + 30
    );

    let pattern: 'reader' | 'scanner' | 'bouncer' = 'bouncer';
    if (isSequential && s.activeTime > 30) pattern = 'reader';
    else if (hasJumps || s.scrollDepth > 50) pattern = 'scanner';

    scrollPatterns.push({
      sessionId: s.events[0]?.session_id || '',
      pattern,
      converted: s.converted,
      scrollDepth: s.scrollDepth,
    });
  });

  // Aggregate by pattern
  const patternStats = {
    reader: { total: 0, converted: 0, avgScroll: 0 },
    scanner: { total: 0, converted: 0, avgScroll: 0 },
    bouncer: { total: 0, converted: 0, avgScroll: 0 },
  };

  scrollPatterns.forEach(p => {
    patternStats[p.pattern].total++;
    if (p.converted) patternStats[p.pattern].converted++;
    patternStats[p.pattern].avgScroll += p.scrollDepth;
  });

  const insights = Object.entries(patternStats).map(([pattern, stats]) => ({
    pattern: pattern as 'reader' | 'scanner' | 'bouncer',
    total: stats.total,
    conversionRate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
    avgScroll: stats.total > 0 ? Math.round(stats.avgScroll / stats.total) : 0,
  })).filter(i => i.total > 0);

  if (insights.length === 0) return null;

  const bestPattern = insights.reduce((best, curr) => 
    curr.conversionRate > best.conversionRate ? curr : best
  , insights[0]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">📖 Scroll Engagement Patterns</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {insights.map(insight => {
          const emoji = insight.pattern === 'reader' ? '📚' : 
                       insight.pattern === 'scanner' ? '👀' : '🚪';
          const bgColor = insight.pattern === 'reader' ? 'from-green-50 to-emerald-50' :
                         insight.pattern === 'scanner' ? 'from-blue-50 to-sky-50' :
                         'from-gray-50 to-slate-50';
          const borderColor = insight.pattern === 'reader' ? 'border-green-300' :
                             insight.pattern === 'scanner' ? 'border-blue-300' :
                             'border-gray-300';

          return (
            <div 
              key={insight.pattern}
              className={`bg-gradient-to-br ${bgColor} border-2 ${borderColor} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{emoji}</span>
                <h4 className="font-bold text-gray-800 capitalize">{insight.pattern}s</h4>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{insight.total}</p>
                <p className="text-xs text-gray-600">
                  {((insight.total / sessions.length) * 100).toFixed(0)}% of visitors
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Avg scroll: <strong>{insight.avgScroll}%</strong>
                </p>
                {insight.conversionRate > 0 && (
                  <p className="text-sm font-semibold text-green-600">
                    {insight.conversionRate.toFixed(0)}% convert
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pattern Descriptions */}
      <div className="space-y-2 text-xs text-gray-600 mb-4">
        <p>📚 <strong>Readers:</strong> Scroll smoothly through content (high engagement)</p>
        <p>👀 <strong>Scanners:</strong> Jump around looking for specific info (research mode)</p>
        <p>🚪 <strong>Bouncers:</strong> Leave quickly with minimal scrolling (lost interest)</p>
      </div>

      {/* Insights */}
      {bestPattern.conversionRate > 0 && (
        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <p className="text-sm text-purple-900">
            💡 <strong>{bestPattern.pattern.charAt(0).toUpperCase() + bestPattern.pattern.slice(1)}s convert best</strong> at {bestPattern.conversionRate.toFixed(0)}%
          </p>
          <p className="text-xs text-purple-800 mt-1">
            {bestPattern.pattern === 'reader' 
              ? 'Your content is engaging! Keep it well-structured with clear headings.'
              : bestPattern.pattern === 'scanner'
                ? 'Visitors are goal-oriented. Use bullet points, FAQs, and clear CTAs.'
                : 'Improve your hook! Most visitors leave without scrolling.'}
          </p>
        </div>
      )}
    </div>
  );
}

