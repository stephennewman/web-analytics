'use client';

import { useEffect } from 'react';

export default function DemoPage() {
  useEffect(() => {
    // Inject demo widgets
    const script = document.createElement('script');
    script.textContent = `
      // Mock feedback widget for demo
      var demoWidgets = {
        createGlassmorphic: function() {
          var container = document.getElementById('demo-glass');
          var widget = document.createElement('div');
          widget.style.cssText = 'position:relative;width:100%;height:400px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px;overflow:hidden;';
          widget.innerHTML = '<div style="position:absolute;bottom:20px;right:20px;width:60px;height:60px;border-radius:30px;background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.12),0 0 0 0 rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;animation:pulseGlow 3s ease-in-out infinite;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div><style>@keyframes pulseGlow { 0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 0 rgba(255,255,255,0.5); } 50% { box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 20px 5px rgba(255,255,255,0.8); }}</style>';
          container.appendChild(widget);
        },
        
        createTicker: function() {
          var container = document.getElementById('demo-ticker');
          var widget = document.createElement('div');
          widget.style.cssText = 'position:relative;width:100%;height:400px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px;overflow:hidden;';
          
          var quotes = [
            "This platform is amazing! Highly recommend.",
            "Great experience, very intuitive interface.",
            "Love the analytics dashboard!",
            "Best tool we've used for tracking.",
            "Simple and powerful. Exactly what we needed."
          ];
          
          var quotesHTML = quotes.map(function(q) {
            return '<span style="display:inline-block;padding:0 40px;white-space:nowrap;">"' + q + '"</span>';
          }).join('');
          
          widget.innerHTML = '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(90deg,#FEF3C7,#FDE68A,#FCD34D);border-top:2px solid #F59E0B;box-shadow:0 -4px 12px rgba(0,0,0,0.1);display:flex;align-items:center;height:50px;font-family:system-ui,-apple-system,sans-serif;"><div style="overflow:hidden;flex:1;position:relative;"><div style="display:flex;animation:tickerScroll 20s linear infinite;">' + quotesHTML + quotesHTML + '</div></div><div style="padding:0 20px;border-left:2px solid #F59E0B;cursor:pointer;display:flex;align-items:center;gap:8px;"><span style="font-size:24px;">🎤</span><span style="font-size:14px;font-weight:600;color:#92400E;">Submit Feedback →</span></div></div><style>@keyframes tickerScroll { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); }}</style>';
          container.appendChild(widget);
        }
      };
      
      demoWidgets.createGlassmorphic();
      demoWidgets.createTicker();
    `;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Design Preview</h1>
          <p className="text-gray-600">Compare both feedback widget styles side-by-side</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Glassmorphic Design */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Glassmorphic Button</h2>
              <p className="text-sm text-gray-600">
                Modern frosted-glass button in bottom-right corner. Subtle pulsing animation draws attention without being intrusive.
              </p>
            </div>
            
            <div id="demo-glass" className="relative"></div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Best For:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Professional/corporate sites</li>
                <li>✓ Clean, minimal design aesthetic</li>
                <li>✓ Users who prefer unobtrusive UI</li>
                <li>✓ Desktop-focused experiences</li>
              </ul>
            </div>
          </div>

          {/* Ticker Design */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Scrolling Ticker</h2>
              <p className="text-sm text-gray-600">
                Eye-catching bottom banner with scrolling feedback quotes. Provides social proof and encourages engagement.
              </p>
            </div>
            
            <div id="demo-ticker" className="relative"></div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Best For:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ E-commerce & landing pages</li>
                <li>✓ High social proof sites</li>
                <li>✓ Maximizing feedback submissions</li>
                <li>✓ Building trust with testimonials</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Glassmorphic</th>
                  <th className="text-center py-3 px-4">Ticker</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Visibility</td>
                  <td className="text-center py-3 px-4">Subtle</td>
                  <td className="text-center py-3 px-4">High</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Social Proof</td>
                  <td className="text-center py-3 px-4">None</td>
                  <td className="text-center py-3 px-4">Shows real quotes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Screen Space</td>
                  <td className="text-center py-3 px-4">Minimal (60px circle)</td>
                  <td className="text-center py-3 px-4">50px bottom banner</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Mobile Friendly</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Engagement Rate</td>
                  <td className="text-center py-3 px-4">Good</td>
                  <td className="text-center py-3 px-4">Excellent</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Brand Presence</td>
                  <td className="text-center py-3 px-4">Neutral</td>
                  <td className="text-center py-3 px-4">Strong (yellow/bee theme)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Test Instructions */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-2">🧪 Want to Test Live?</h2>
          <p className="text-blue-800 mb-4">
            These are static previews. To test the full interactive experience:
          </p>
          <ol className="text-blue-800 space-y-2 list-decimal list-inside">
            <li>Go to <span className="font-mono bg-blue-100 px-2 py-1 rounded">Dashboard → Settings</span></li>
            <li>Enable the feedback widget</li>
            <li>Select a design style</li>
            <li>Visit your live site to test recording, playback, and submission</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

