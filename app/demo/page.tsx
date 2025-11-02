import Link from 'next/link';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function DemoPage() {
  const demos = [
    {
      id: 'glassmorphic',
      icon: '🪟',
      title: 'Glassmorphic',
      subtitle: 'Modern SaaS Dashboard',
      description: 'Clean, subtle, unobtrusive. Perfect for productivity apps and dashboards.',
      tags: ['Most Popular', 'Default'],
      color: 'purple',
      href: '/demo/glassmorphic'
    },
    {
      id: 'ticker',
      icon: '📰',
      title: 'Ticker Bar',
      subtitle: 'E-commerce Store',
      description: 'Eye-catching animated bar. Slides up, then minimizes. Great for high-traffic sites.',
      tags: ['Animated', 'Playful'],
      color: 'pink',
      href: '/demo/ticker'
    },
    {
      id: 'b2b',
      icon: '💼',
      title: 'B2B SaaS',
      subtitle: 'Product Roadmap',
      description: 'Professional, minimal design. Perfect for enterprise tools and B2B products.',
      tags: ['Professional', 'Clean'],
      color: 'slate',
      href: '/demo/b2b'
    },
    {
      id: 'honeybee',
      icon: '🐝',
      title: 'Honey-Bee',
      subtitle: 'Fitness App',
      description: 'Fun, bouncy, energetic. Ideal for consumer apps and lifestyle products.',
      tags: ['Fun', 'Animated'],
      color: 'yellow',
      href: '/demo/honey-bee'
    },
    {
      id: 'glassbar',
      icon: '💬',
      title: 'Glass Bar',
      subtitle: 'Content Blog',
      description: 'Dual mode: Type OR speak. Centered bar with text input and voice option.',
      tags: ['Flexible', 'Type + Voice'],
      color: 'indigo',
      href: '/demo/glass-bar'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BeeSwarm size="sm" count={3} />
              <span className="text-xl font-bold text-gradient-gold">Trackerbeez</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          Try <span className="text-gradient-gold">Every Widget</span> Live
        </h1>
        <p className="text-2xl text-zinc-400 mb-4 max-w-3xl mx-auto">
          5 fully interactive demos. Each widget is <span className="text-yellow-400 font-semibold">actually working</span>. 
        </p>
        <p className="text-lg text-zinc-500 mb-12">
          Click to explore. Record voice. Type feedback. See what fits your product. 🐝
        </p>
      </div>

      {/* Widget Demo Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              href={demo.href}
              className="group bg-zinc-900 border-2 border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all hover:scale-105"
            >
              {/* Preview Area */}
              <div className={`h-48 bg-gradient-to-br ${
                demo.color === 'purple' ? 'from-purple-500 to-indigo-500' :
                demo.color === 'pink' ? 'from-pink-500 to-rose-500' :
                demo.color === 'slate' ? 'from-slate-600 to-slate-800' :
                demo.color === 'yellow' ? 'from-yellow-400 to-amber-500' :
                'from-indigo-500 to-purple-500'
              } flex items-center justify-center relative overflow-hidden`}>
                <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {demo.icon}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur text-white text-xs font-bold rounded-full">
                  LIVE DEMO
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition mb-1">
                      {demo.title}
                    </h3>
                    <p className="text-sm text-zinc-500">{demo.subtitle}</p>
                  </div>
                </div>

                <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                  {demo.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {demo.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs font-medium border border-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  Try it Live
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-12 text-center text-black">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Add This to Your Product?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Pick your favorite widget style. Embed it in 60 seconds. Start collecting feedback today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-black text-yellow-400 font-bold text-lg rounded-lg hover:bg-gray-900 transition"
            >
              Get Started Free 🚀
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-black text-black font-bold text-lg rounded-lg hover:bg-black/10 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
