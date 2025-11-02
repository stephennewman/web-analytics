'use client';

import Script from 'next/script';
import Link from 'next/link';

export default function HoneyBeeDemo() {
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
              clientId: 'demo-honeybee',
              widgetStyle: 'honey-bee'
            });
          }
        }}
      />

      <div className="min-h-screen bg-amber-50">
        {/* Demo Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-b border-amber-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/demo" className="flex items-center gap-2 hover:text-amber-900 transition font-medium">
                ← Back to All Demos
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-black text-yellow-400 font-bold rounded-lg hover:bg-gray-900 transition"
              >
                Get This Widget
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Content - Fitness/Lifestyle App */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">💪 FitBuzz</h1>
            <p className="text-xl text-gray-700 mb-6">Your personal fitness companion</p>
            <button className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-full hover:shadow-xl transition">
              Start Your Journey
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <div className="text-4xl mb-3">🔥</div>
              <div className="text-3xl font-bold text-gray-900">1,247</div>
              <div className="text-sm text-gray-600">Calories Burned</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <div className="text-4xl mb-3">⏱️</div>
              <div className="text-3xl font-bold text-gray-900">42:15</div>
              <div className="text-sm text-gray-600">Active Minutes</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <div className="text-4xl mb-3">👟</div>
              <div className="text-3xl font-bold text-gray-900">8,432</div>
              <div className="text-sm text-gray-600">Steps Today</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-3xl font-bold text-gray-900">12/30</div>
              <div className="text-sm text-gray-600">Monthly Goal</div>
            </div>
          </div>

          {/* Workout Plans */}
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Today's Workouts</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { emoji: '🏋️', title: 'Strength Training', time: '30 min', level: 'Intermediate' },
              { emoji: '🏃', title: 'Cardio Blast', time: '20 min', level: 'Beginner' },
              { emoji: '🧘', title: 'Yoga Flow', time: '45 min', level: 'All Levels' }
            ].map((workout, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition cursor-pointer group">
                <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-12 flex items-center justify-center">
                  <span className="text-7xl group-hover:scale-110 transition">{workout.emoji}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{workout.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>⏱️ {workout.time}</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                      {workout.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Progress This Week</h3>
            <div className="flex items-end justify-between h-48 gap-3">
              {[65, 80, 70, 90, 85, 95, 88].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t-lg hover:from-amber-500 hover:to-yellow-400 transition cursor-pointer"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 font-medium">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 border-2 border-amber-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">🐝 Honey-Bee Widget</h3>
            <p className="text-gray-900 mb-4">
              <strong>Try it:</strong> Look for the bouncing bee button in the bottom-right! 
              Our most playful widget. Perfect for consumer apps, wellness, and lifestyle products.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-900">
              <div>
                <strong>Best for:</strong> Fitness apps, consumer products, fun/playful brands
              </div>
              <div>
                <strong>Style:</strong> Animated, friendly, high-energy
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

