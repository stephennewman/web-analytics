import Link from 'next/link';
import { getButtonClass } from '@/lib/design-system';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated honey drip background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-1/4 w-40 h-40 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-60 left-1/2 w-36 h-36 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          {/* Nav Bar */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <BeeSwarm size="md" count={3} />
              <span className="text-2xl font-bold text-gradient-gold">Trackerbeez</span>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="px-4 py-2 text-yellow-400 hover:text-yellow-300 font-medium transition">
                Sign In
              </Link>
              <Link href="/signup" className={getButtonClass('primary')}>
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Stop Guessing What Users Want.
              <br />
              <span className="text-gradient-gold">Start Listening.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-300 mb-6 max-w-3xl mx-auto">
              Capture <span className="text-yellow-400 font-semibold">voice feedback</span> from your users, 
              transcribe it with AI, and turn it into <span className="text-yellow-400 font-semibold">roadmap tickets</span>.
            </p>
            <p className="text-lg text-zinc-400 mb-12">
              Because reading minds is hard. Reading transcripts is easy. 🐝
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-lg rounded-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all hover:scale-105"
              >
                Start Free • Embed in 60s ⚡
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 font-bold text-lg rounded-lg hover:bg-yellow-400 hover:text-black transition-all"
              >
                See Live Demos 🎬
              </Link>
            </div>

            {/* Demo Widget Preview */}
            <div className="relative">
              <div className="bg-zinc-900 rounded-xl border-2 border-zinc-800 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-sm text-zinc-500">yourproduct.com</span>
                </div>
                <div className="bg-zinc-800 rounded-lg p-12 relative min-h-[320px] flex items-center justify-center">
                  <p className="text-zinc-600 text-center text-lg">Your SaaS / Product / Site</p>
                  
                  {/* Widget Preview - Floating Bee Style */}
                  <div className="absolute bottom-6 right-6 group">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur opacity-40 group-hover:opacity-60 transition"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition shadow-xl">
                        <span className="text-3xl">🐝</span>
                      </div>
                    </div>
                    <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white text-black px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap">
                        💬 Share feedback
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                ↑ Embeddable widget • 5 styles • Works anywhere • Captures voice or text
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-zinc-950 py-20 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Your Feedback Loop is <span className="text-red-500">Broken</span>
            </h2>
            <p className="text-xl text-zinc-400">Sound familiar?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
              <div className="text-4xl mb-4">😶</div>
              <h3 className="text-xl font-bold mb-3 text-white">Radio Silence</h3>
              <p className="text-zinc-400">
                Users ghost your "Contact Us" form. Nobody fills out your 17-field survey. 
                You're flying blind.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
              <div className="text-4xl mb-4">🤯</div>
              <h3 className="text-xl font-bold mb-3 text-white">Feedback Chaos</h3>
              <p className="text-zinc-400">
                Scattered across Slack, email, support tickets, Discord. No single source of truth. 
                Good ideas get lost.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold mb-3 text-white">Building the Wrong Thing</h3>
              <p className="text-zinc-400">
                Your roadmap is a guess. You ship features nobody asked for. Users churn. 
                Repeat.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              How <span className="text-gradient-gold">Trackerbeez</span> Works
            </h2>
            <p className="text-xl text-zinc-400">Three steps. Seriously.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg">
                1
              </div>
              <div className="bg-zinc-900 border border-yellow-400/30 rounded-xl p-8 pt-10">
                <div className="text-5xl mb-4">🎤</div>
                <h3 className="text-2xl font-bold mb-4 text-white">Embed Widget</h3>
                <p className="text-zinc-400 mb-4">
                  Drop a 2-line script into your product. Choose from 5 widget styles. 
                  Users see a floating button.
                </p>
                <div className="bg-black/50 rounded p-3 text-sm font-mono text-yellow-400">
                  &lt;script src="track.js"&gt;&lt;/script&gt;
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg">
                2
              </div>
              <div className="bg-zinc-900 border border-yellow-400/30 rounded-xl p-8 pt-10">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold mb-4 text-white">AI Transcribes</h3>
                <p className="text-zinc-400 mb-4">
                  Users record voice (or type text). Whisper API transcribes instantly. 
                  GPT-4o analyzes sentiment, themes, insights.
                </p>
                <div className="bg-black/50 rounded p-3 text-sm text-zinc-500">
                  "The checkout flow is confusing..."<br/>
                  <span className="text-green-400">✓ Transcribed</span><br/>
                  <span className="text-blue-400">💡 Insight: UX friction</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg">
                3
              </div>
              <div className="bg-zinc-900 border border-yellow-400/30 rounded-xl p-8 pt-10">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-4 text-white">Build Roadmap</h3>
                <p className="text-zinc-400 mb-4">
                  Dashboard shows all feedback. Turn insights into tickets. 
                  AI scores priority. Ship what matters.
                </p>
                <div className="bg-black/50 rounded p-3 text-sm text-zinc-500">
                  <span className="text-yellow-400">🐝 3 votes</span> • Fix checkout<br/>
                  Status: <span className="text-purple-400">Building</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-zinc-400">No bloat. Just the good stuff.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎙️', title: 'Voice + Text Input', desc: 'Let users speak OR type. Whatever they prefer.' },
              { icon: '🌐', title: 'Multi-Product Tracking', desc: 'One account. Track 10 sites/products. Separate dashboards.' },
              { icon: '🎨', title: '5 Widget Styles', desc: 'Bee, Glass Bar, Ticker, B2B, Glassmorphic. Match your vibe.' },
              { icon: '🧠', title: 'AI Analysis', desc: 'Auto sentiment, themes, insights. No manual reading.' },
              { icon: '🗳️', title: 'Upvote System', desc: 'Users upvote feedback. See what really matters.' },
              { icon: '📊', title: 'Priority Scoring', desc: 'AI ranks tickets by impact. Focus on what moves the needle.' },
              { icon: '💻', title: 'Cursor MCP', desc: 'Ask @trackerbeez from your editor. Ship faster.' },
              { icon: '⚡', title: 'Instant Setup', desc: 'Embed in 60 seconds. Seriously. We timed it.' },
              { icon: '🔒', title: 'Privacy First', desc: 'Your data. Your control. GDPR ready. No shady stuff.' }
            ].map((feature, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-yellow-400/50 transition group">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-yellow-400 transition">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Teaser */}
      <div className="py-20 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Pricing That Doesn't Sting 🐝
          </h2>
          <p className="text-2xl text-zinc-300 mb-8">
            Start free. Upgrade when you're ready.
          </p>
          <div className="bg-zinc-900 border border-yellow-400/30 rounded-2xl p-8 inline-block">
            <div className="text-5xl font-bold text-gradient-gold mb-2">Free Forever</div>
            <p className="text-zinc-400 text-lg mb-6">1 product • 100 feedback/month • All features</p>
            <p className="text-sm text-zinc-500">
              Need more? Pro plans start at $29/mo for unlimited feedback + priority support.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Ready to Build What Users <span className="text-gradient-gold">Actually Want?</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12">
            Join the hive. Start listening. Ship smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-xl rounded-lg hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all hover:scale-105"
            >
              Get Started Free 🚀
            </Link>
            <Link
              href="/demo"
              className="px-10 py-5 border-2 border-yellow-400 text-yellow-400 font-bold text-xl rounded-lg hover:bg-yellow-400 hover:text-black transition-all"
            >
              Try Live Demo
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-8">
            No credit card. No BS. Just better feedback.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BeeSwarm size="sm" count={2} />
              <span className="text-zinc-500 text-sm">© 2025 Trackerbeez. Built with 🍯</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="/privacy" className="hover:text-yellow-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-yellow-400 transition">Terms</Link>
              <Link href="/docs" className="hover:text-yellow-400 transition">Docs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
