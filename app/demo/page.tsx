'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function DemoPage() {
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  const scrollToWidget = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveWidget(id);
      setTimeout(() => setActiveWidget(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BeeSwarm size="sm" count={3} />
              <span className="text-xl font-bold text-gradient-gold">Trackerbee</span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all text-sm"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Try Every Widget Style
        </h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
          5 unique designs. Each embedded on a different platform. 
          Click them. Record feedback. See what fits your product.
        </p>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => scrollToWidget('glassmorphic')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition text-sm font-medium border border-zinc-700"
          >
            🪟 Glassmorphic
          </button>
          <button
            onClick={() => scrollToWidget('ticker')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition text-sm font-medium border border-zinc-700"
          >
            📰 Ticker Bar
          </button>
          <button
            onClick={() => scrollToWidget('b2b')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition text-sm font-medium border border-zinc-700"
          >
            💼 B2B SaaS
          </button>
          <button
            onClick={() => scrollToWidget('honeybee')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition text-sm font-medium border border-zinc-700"
          >
            🐝 Honey-Bee
          </button>
          <button
            onClick={() => scrollToWidget('glassbar')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition text-sm font-medium border border-zinc-700"
          >
            🪟 Glass Bar
          </button>
        </div>
      </div>

      {/* Widget Demos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-20">
        
        {/* 1. Glassmorphic - Modern SaaS Dashboard */}
        <div id="glassmorphic" className={`transition-all duration-500 ${activeWidget === 'glassmorphic' ? 'ring-4 ring-yellow-400 rounded-2xl p-2' : ''}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold">1. Glassmorphic Button</h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                Default • Most Popular
              </span>
            </div>
            <p className="text-zinc-400 text-lg">
              Clean, modern, unobtrusive. Perfect for SaaS dashboards and productivity apps. 
              Floats in bottom-right corner with subtle glow animation.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
            {/* Browser Chrome */}
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-zinc-400">app.yourcompany.com/dashboard</span>
              </div>
            </div>

            {/* Fake SaaS Dashboard */}
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 min-h-[600px] p-8">
              {/* Sidebar */}
              <div className="absolute left-0 top-0 w-64 h-full bg-slate-950/50 backdrop-blur-sm border-r border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"></div>
                  <div className="font-bold text-lg">YourApp</div>
                </div>
                <nav className="space-y-2">
                  {['Dashboard', 'Projects', 'Team', 'Settings'].map((item, i) => (
                    <div key={i} className={`px-4 py-2 rounded-lg ${i === 0 ? 'bg-purple-500/20 text-purple-300' : 'text-zinc-400'}`}>
                      {item}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="ml-64 pl-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-zinc-400 mb-8">Welcome back, Alex</p>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Active Projects', value: '12', color: 'blue' },
                    { label: 'Team Members', value: '8', color: 'green' },
                    { label: 'Tasks Due', value: '24', color: 'orange' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-zinc-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                        <div className="flex-1">
                          <div className="text-sm text-zinc-300">Activity item {i + 1}</div>
                          <div className="text-xs text-zinc-500">2 hours ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="absolute bottom-6 right-6 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center animate-pulse">
                  <span className="text-2xl">🎤</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-slate-900 animate-ping"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-zinc-400">Best for:</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">SaaS Apps</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Dashboards</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Web Apps</span>
          </div>
        </div>

        {/* 2. Ticker - E-Commerce Product Page */}
        <div id="ticker" className={`transition-all duration-500 ${activeWidget === 'ticker' ? 'ring-4 ring-yellow-400 rounded-2xl p-2' : ''}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold">2. Scrolling Ticker Bar</h2>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                Engagement Focused
              </span>
            </div>
            <p className="text-zinc-400 text-lg">
              Bottom ticker bar showing recent feedback quotes. Scrolls automatically to show social proof. 
              Great for e-commerce and content sites.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-zinc-400">shop.example.com/product/wireless-headphones</span>
              </div>
            </div>

            {/* Fake E-Commerce Product Page */}
            <div className="relative bg-white text-black min-h-[600px]">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">ShopBee 🛍️</div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Products</span>
                    <span className="text-gray-600 hover:text-gray-900 cursor-pointer">About</span>
                    <span className="px-4 py-1 bg-black text-white rounded-lg cursor-pointer">Cart (0)</span>
                  </div>
                </div>
              </div>

              {/* Product Section */}
              <div className="px-8 py-12">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                  {/* Product Images */}
                  <div>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                      <div className="text-8xl">🎧</div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg"></div>
                      ))}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h1 className="text-4xl font-bold mb-4">Premium Wireless Headphones</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-yellow-400">{'★★★★★'}</div>
                      <span className="text-gray-600">(248 reviews)</span>
                    </div>
                    <div className="text-3xl font-bold mb-6">$299.99</div>
                    <p className="text-gray-600 mb-8">
                      Experience premium sound quality with active noise cancellation, 
                      30-hour battery life, and comfortable over-ear design.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-black border-2 border-gray-300 cursor-pointer"></div>
                        <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-gray-300 cursor-pointer"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-300 cursor-pointer"></div>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition mb-4">
                      Add to Cart
                    </button>
                    <button className="w-full py-4 border-2 border-gray-300 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticker Widget (bottom bar) */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center overflow-hidden">
                <div className="flex animate-scroll whitespace-nowrap px-4 text-white font-medium">
                  <span className="px-8">"Love these headphones!" 🎧</span>
                  <span className="px-8">"Best purchase this year" ⭐</span>
                  <span className="px-8">"Sound quality is amazing" 🎵</span>
                  <span className="px-8">"Worth every penny" 💯</span>
                </div>
                <div className="absolute right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                  <span className="text-2xl">🎤</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-zinc-400">Best for:</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">E-Commerce</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Product Pages</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">High Traffic Sites</span>
          </div>
        </div>

        {/* 3. B2B SaaS - Enterprise Settings Page */}
        <div id="b2b" className={`transition-all duration-500 ${activeWidget === 'b2b' ? 'ring-4 ring-yellow-400 rounded-2xl p-2' : ''}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold">3. B2B Product Roadmap</h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                Enterprise Ready
              </span>
            </div>
            <p className="text-zinc-400 text-lg">
              Fast-scrolling feedback ticker with professional slate theme. 
              Perfect for B2B SaaS wanting to show they listen to customers.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-zinc-400">enterprise.yourcompany.com/settings</span>
              </div>
            </div>

            {/* Fake B2B Settings Page */}
            <div className="relative bg-slate-50 text-slate-900 min-h-[600px]">
              {/* Top Nav */}
              <div className="bg-white border-b border-slate-200 px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800"></div>
                    <span className="font-bold text-lg">Enterprise Platform</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">Acme Corp</span>
                    <div className="w-8 h-8 rounded-full bg-slate-300"></div>
                  </div>
                </div>
              </div>

              {/* Settings Layout */}
              <div className="flex min-h-[550px]">
                {/* Settings Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 p-6">
                  <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Settings</h2>
                  <nav className="space-y-1">
                    {['Account', 'Team', 'Billing', 'Integrations', 'Security', 'API Keys'].map((item, i) => (
                      <div 
                        key={i} 
                        className={`px-3 py-2 rounded text-sm cursor-pointer ${i === 1 ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {item}
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-8">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl font-bold mb-2">Team Settings</h1>
                    <p className="text-slate-600 mb-8">Manage your team members and permissions</p>

                    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                      <h3 className="font-semibold mb-4">Team Members (8)</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Sarah Johnson', role: 'Admin', email: 'sarah@acme.com' },
                          { name: 'Mike Chen', role: 'Editor', email: 'mike@acme.com' },
                          { name: 'Emma Davis', role: 'Viewer', email: 'emma@acme.com' }
                        ].map((member, i) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-slate-500">{member.email}</div>
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                              {member.role}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="mt-4 w-full py-2 border-2 border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition">
                        + Invite Team Member
                      </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <div className="font-medium text-blue-900 mb-1">Need help?</div>
                        <div className="text-sm text-blue-800">Check our documentation or contact support.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* B2B Ticker */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-800 flex items-center overflow-hidden border-t-2 border-slate-700">
                <div className="flex animate-scroll-fast whitespace-nowrap text-slate-200 text-sm font-medium">
                  <span className="px-10">💬 "Great SSO integration!" - Alex M.</span>
                  <span className="px-10">💬 "API docs are excellent" - Sarah K.</span>
                  <span className="px-10">💬 "Love the bulk actions" - Mike R.</span>
                  <span className="px-10">💬 "Export feature saved us hours" - Emma T.</span>
                </div>
                <div className="absolute right-4 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                  <span className="text-lg">🎤</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-zinc-400">Best for:</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">B2B SaaS</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Enterprise</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Product Roadmaps</span>
          </div>
        </div>

        {/* 4. Honey-Bee - Gamified Fitness App */}
        <div id="honeybee" className={`transition-all duration-500 ${activeWidget === 'honeybee' ? 'ring-4 ring-yellow-400 rounded-2xl p-2' : ''}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold">4. Honey-Bee (Gamified)</h2>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium border border-yellow-500/30">
                Most Fun 🐝
              </span>
            </div>
            <p className="text-zinc-400 text-lg">
              Large, bouncing bee button with animations. Playful and engaging. 
              Perfect for consumer apps, games, and fun brands.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-zinc-400">app.fitbuzz.com/dashboard</span>
              </div>
            </div>

            {/* Fake Fitness App */}
            <div className="relative bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 min-h-[600px] text-white p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🏃</div>
                  <div>
                    <div className="font-bold text-2xl">FitBuzz</div>
                    <div className="text-sm text-white/80">Level 12 • 🔥 7 day streak</div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm"></div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: '👟', label: 'Steps Today', value: '8,234', goal: '10,000' },
                  { icon: '🔥', label: 'Calories', value: '420', goal: '600' },
                  { icon: '⏱️', label: 'Active Min', value: '45', goal: '60' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                    <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full" 
                        style={{ width: `${(parseInt(stat.value.replace(',', '')) / parseInt(stat.goal.replace(',', ''))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/70 mt-1">Goal: {stat.goal}</div>
                  </div>
                ))}
              </div>

              {/* Activity Feed */}
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <h3 className="font-bold text-xl mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {[
                    { icon: '🏃', activity: 'Morning Run', time: '2h ago', points: '+50' },
                    { icon: '🧘', activity: 'Yoga Session', time: '5h ago', points: '+30' },
                    { icon: '💪', activity: 'Strength Training', time: 'Yesterday', points: '+40' }
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{activity.icon}</div>
                        <div>
                          <div className="font-semibold">{activity.activity}</div>
                          <div className="text-sm text-white/70">{activity.time}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                        {activity.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honey-Bee Widget (large bouncing button) */}
              <div className="absolute bottom-6 right-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-amber-600 animate-bounce cursor-pointer">
                    <span className="text-4xl">🐝</span>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border-2 border-yellow-200">
                    Share Buzz!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-zinc-400">Best for:</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Consumer Apps</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Gaming</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Fun Brands</span>
          </div>
        </div>

        {/* 5. Glass Bar - Content/Blog Site */}
        <div id="glassbar" className={`transition-all duration-500 ${activeWidget === 'glassbar' ? 'ring-4 ring-yellow-400 rounded-2xl p-2' : ''}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold">5. Glass Bar (Dual Mode)</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                Type OR Voice
              </span>
            </div>
            <p className="text-zinc-400 text-lg">
              Centered bottom bar with text input + voice option. Type and hit Enter for quick feedback, 
              or click the mic for voice. Perfect for blogs, content sites, and portfolios.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-zinc-400">blog.yoursite.com/latest-post</span>
              </div>
            </div>

            {/* Fake Blog Post */}
            <div className="relative bg-white text-black min-h-[600px]">
              {/* Blog Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="font-serif font-bold text-2xl">TheBlog</div>
                  <nav className="flex gap-6 text-sm">
                    <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Articles</span>
                    <span className="text-gray-600 hover:text-gray-900 cursor-pointer">About</span>
                    <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Newsletter</span>
                  </nav>
                </div>
              </div>

              {/* Blog Content */}
              <article className="max-w-3xl mx-auto px-8 py-12">
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                  <span>Design</span>
                  <span>•</span>
                  <span>5 min read</span>
                  <span>•</span>
                  <span>Dec 15, 2024</span>
                </div>

                <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
                  The Future of User Feedback in Modern Web Design
                </h1>

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="font-medium">Alex Rivera</div>
                    <div className="text-sm text-gray-500">Product Designer</div>
                  </div>
                </div>

                <div className="aspect-[2/1] bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-8 flex items-center justify-center">
                  <span className="text-6xl">🎨</span>
                </div>

                <div className="prose prose-lg">
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    User feedback has evolved from simple contact forms to rich, 
                    interactive experiences. In this article, we explore how modern 
                    feedback tools are changing the way we build products.
                  </p>

                  <h2 className="text-2xl font-serif font-bold mt-8 mb-4">The Problem with Traditional Feedback</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Forms are boring. Surveys go unanswered. Email feedback gets lost 
                    in crowded inboxes. Modern users want faster, easier ways to share 
                    their thoughts without interrupting their flow.
                  </p>

                  <div className="bg-gray-50 border-l-4 border-gray-900 p-6 my-8">
                    <p className="text-lg italic text-gray-800">
                      "The best feedback comes when users can speak naturally, 
                      in their own words, without friction."
                    </p>
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Voice feedback represents the next evolution. It's fast, natural, 
                    and captures nuance that text can miss. Combined with AI transcription, 
                    it becomes a powerful tool for product teams.
                  </p>
                </div>
              </article>

              {/* Glass Bar Widget */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl">
                <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl">
                  <input 
                    type="text" 
                    placeholder="Type feedback or share via voice..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                    readOnly
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-110 transition">
                    <span className="text-white text-lg">🎤</span>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-zinc-400">Best for:</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Blogs</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Content Sites</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">Quick Feedback</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            Found your style? Start collecting feedback.
          </h2>
          <p className="text-xl text-black/80 mb-8">
            Sign up free. Pick a widget. Embed in 60 seconds.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-black text-white font-bold text-lg rounded-lg hover:bg-gray-900 transition-all shadow-2xl"
          >
            Start Free • No Credit Card
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BeeSwarm size="sm" count={3} />
            <span className="text-xl font-bold text-gradient-gold">Trackerbee</span>
          </div>
          <div className="text-sm text-zinc-500">
            © 2025 Trackerbee. Stop guessing. Start listening. 🐝
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll-fast {
          animation: scroll-fast 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
