'use client';

import Script from 'next/script';
import Link from 'next/link';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function GlasmorphicDemo() {
  return (
    <>
      <Script
        src="/track.js"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-ignore
          if (window.feedbackWidget) {
            // @ts-ignore
            window.feedbackWidget.init({
              clientId: 'demo-glassmorphic',
              widgetStyle: 'glassmorphic'
            });
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {/* Demo Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/demo" className="flex items-center gap-2 text-white hover:text-yellow-300 transition">
                ← Back to All Demos
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-white text-purple-600 font-bold rounded-lg hover:shadow-xl transition"
              >
                Get This Widget
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Content - Modern SaaS Dashboard */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Fake Browser Bar */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-sm text-gray-500">app.yourproduct.com/dashboard</span>
            </div>

            {/* Fake Dashboard Content */}
            <div className="p-8 min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                  <p className="text-gray-600">Welcome back! Here's what's happening.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Settings
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    New Project
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Users</div>
                  <div className="text-3xl font-bold text-gray-900">12,483</div>
                  <div className="text-sm text-green-600 mt-2">↑ 12% from last month</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Revenue</div>
                  <div className="text-3xl font-bold text-gray-900">$45,231</div>
                  <div className="text-sm text-green-600 mt-2">↑ 8% from last month</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Active Projects</div>
                  <div className="text-3xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-600 mt-2">→ No change</div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[40, 70, 55, 80, 65, 90, 75, 95, 85, 70, 80, 90].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t opacity-70 hover:opacity-100 transition cursor-pointer"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-3">🪟 Glassmorphic Widget</h3>
            <p className="text-white/80 mb-4">
              <strong>Try it:</strong> Look for the floating button in the bottom-right corner. 
              Click it, then record a voice message or type text feedback. See how it feels!
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-yellow-300">Best for:</strong> Modern SaaS, productivity apps, dashboards
              </div>
              <div>
                <strong className="text-yellow-300">Style:</strong> Clean, subtle, unobtrusive
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

