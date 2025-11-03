'use client';

import Script from 'next/script';
import Link from 'next/link';

export default function GlassBarDemo() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.feedbackWidgetConfig = {
              clientId: 'demo-glassbar',
              widgetStyle: 'glass-bar'
            };
          `
        }}
      />
      <Script
        src="/track.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-white">
        {/* Demo Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/demo" className="flex items-center gap-2 hover:text-purple-200 transition">
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

        {/* Demo Content - Blog/Content Site */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Blog Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">The Content Blog</h1>
            <p className="text-gray-600">Insights, stories, and ideas worth sharing</p>
            <div className="flex justify-center gap-6 mt-6 text-gray-600">
              <a href="#" className="hover:text-purple-600">Home</a>
              <a href="#" className="hover:text-purple-600">Articles</a>
              <a href="#" className="hover:text-purple-600">About</a>
              <a href="#" className="hover:text-purple-600">Contact</a>
            </div>
          </header>

          {/* Featured Article */}
          <article className="mb-12">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-12 mb-6">
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Featured</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">
                The Future of User Feedback in 2024
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Voice feedback is transforming how products evolve. Here's why traditional surveys are dying 
                and what's replacing them.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>By Sarah Johnson</span>
                <span>•</span>
                <span>5 min read</span>
                <span>•</span>
                <span>Jan 15, 2024</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Voice Feedback Matters</h3>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
                mollit anim id est laborum.
              </p>

              <blockquote className="border-l-4 border-purple-500 pl-6 py-2 italic text-gray-600 my-8">
                "The best product feedback comes from listening, not reading surveys."
              </blockquote>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
                totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae 
                dicta sunt explicabo.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Voice feedback has 10x higher completion rates than traditional surveys</li>
                <li>AI transcription makes voice data as searchable as text</li>
                <li>Users prefer speaking over typing for detailed feedback</li>
                <li>Integration with roadmap tools closes the feedback loop</li>
              </ul>

              <p className="mt-8">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur 
                magni dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
            </div>
          </article>

          {/* More Articles */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: '10 UX Patterns That Convert', date: 'Jan 12, 2024', tag: 'Design' },
                { title: 'Building a User-First Roadmap', date: 'Jan 8, 2024', tag: 'Product' },
                { title: 'AI in Product Development', date: 'Jan 5, 2024', tag: 'Tech' },
                { title: 'Customer Feedback Best Practices', date: 'Jan 1, 2024', tag: 'Strategy' }
              ].map((article, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-6 hover:border-purple-400 transition cursor-pointer">
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                    {article.tag}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 mt-2 mb-3">{article.title}</h4>
                  <span className="text-sm text-gray-500">{article.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-3">🪟 Glass Bar Widget (Dual Mode)</h3>
            <p className="mb-4">
              <strong>Try it:</strong> Look at the bottom center of the screen! 
              Type feedback directly into the bar OR click the mic for voice. Best of both worlds.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-purple-200">Best for:</strong> Blogs, content sites, portfolios, marketing pages
              </div>
              <div>
                <strong className="text-purple-200">Style:</strong> Flexible, accessible, user-friendly
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

