'use client';

import Script from 'next/script';
import Link from 'next/link';

export default function B2BDemo() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.feedbackWidgetConfig = {
              clientId: 'demo-b2b',
              widgetStyle: 'b2b-saas'
            };
          `
        }}
      />
      <Script
        src="/track.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-slate-50">
        {/* Demo Header */}
        <div className="bg-slate-900 text-white border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/demo" className="flex items-center gap-2 hover:text-blue-300 transition">
                ← Back to All Demos
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Get This Widget
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Content - B2B Product Roadmap */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Product Roadmap</h1>
                <p className="text-slate-600">Vote on features • Track progress • Shape our direction</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">
                Submit Idea
              </button>
            </div>
          </div>

          {/* Roadmap Columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Planned */}
            <div>
              <div className="bg-blue-100 rounded-t-xl px-4 py-3 border-b-2 border-blue-500">
                <h3 className="font-bold text-blue-900">📋 Planned (12)</h3>
              </div>
              <div className="bg-white rounded-b-xl border border-slate-200 p-4 space-y-3">
                {['Dark Mode Support', 'Advanced Filters', 'Bulk Export', 'Email Notifications'].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-blue-400 cursor-pointer transition">
                    <h4 className="font-semibold text-slate-900 mb-2">{item}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">👍 {Math.floor(Math.random() * 50) + 10} votes</span>
                      <span className="text-blue-600 font-medium">Q2 2024</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="bg-purple-100 rounded-t-xl px-4 py-3 border-b-2 border-purple-500">
                <h3 className="font-bold text-purple-900">🚧 In Progress (5)</h3>
              </div>
              <div className="bg-white rounded-b-xl border border-slate-200 p-4 space-y-3">
                {['API Documentation', 'Mobile App Beta', 'Slack Integration'].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-purple-400 cursor-pointer transition">
                    <h4 className="font-semibold text-slate-900 mb-2">{item}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">👍 {Math.floor(Math.random() * 100) + 50} votes</span>
                      <span className="text-purple-600 font-medium">Building...</span>
                    </div>
                    <div className="mt-2 bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-600 rounded-full h-2" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipped */}
            <div>
              <div className="bg-green-100 rounded-t-xl px-4 py-3 border-b-2 border-green-500">
                <h3 className="font-bold text-green-900">✅ Shipped (23)</h3>
              </div>
              <div className="bg-white rounded-b-xl border border-slate-200 p-4 space-y-3">
                {['SSO Login', 'Custom Branding', 'Team Permissions', 'CSV Import'].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-green-400 cursor-pointer transition">
                    <h4 className="font-semibold text-slate-900 mb-2">{item}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">👍 {Math.floor(Math.random() * 150) + 100} votes</span>
                      <span className="text-green-600 font-medium">✓ Live</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-slate-900 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-3">💼 B2B SaaS Widget</h3>
            <p className="text-slate-300 mb-4">
              <strong>Try it:</strong> Look for the minimal button in the bottom-right. 
              Professional, clean design perfect for B2B products and enterprise tools.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-400">Best for:</strong> B2B SaaS, enterprise tools, developer platforms
              </div>
              <div>
                <strong className="text-blue-400">Style:</strong> Professional, minimal, trustworthy
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

