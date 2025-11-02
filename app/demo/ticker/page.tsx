import Script from 'next/script';
import Link from 'next/link';

export default function TickerDemo() {
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
              clientId: 'demo-ticker',
              widgetStyle: 'ticker'
            });
          }
        }}
      />

      <div className="min-h-screen bg-white">
        {/* Demo Header */}
        <div className="bg-black text-white border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/demo" className="flex items-center gap-2 hover:text-yellow-300 transition">
                ← Back to All Demos
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-xl transition"
              >
                Get This Widget
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Content - E-commerce Site */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Store Header */}
          <header className="border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">🛍️ The Fashion Store</h1>
              <div className="flex items-center gap-6">
                <button className="text-gray-600 hover:text-gray-900">Search</button>
                <button className="text-gray-600 hover:text-gray-900">Cart (0)</button>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  Sign In
                </button>
              </div>
            </div>
            <nav className="flex gap-6 mt-4 text-gray-600">
              <a href="#" className="hover:text-gray-900 font-medium">New Arrivals</a>
              <a href="#" className="hover:text-gray-900">Men</a>
              <a href="#" className="hover:text-gray-900">Women</a>
              <a href="#" className="hover:text-gray-900">Accessories</a>
              <a href="#" className="hover:text-gray-900">Sale</a>
            </nav>
          </header>

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-12 mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Spring Collection 2024</h2>
            <p className="text-lg text-gray-700 mb-6">Fresh styles for the new season. Up to 40% off.</p>
            <button className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
              Shop Now
            </button>
          </div>

          {/* Product Grid */}
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Trending Now</h3>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3 flex items-center justify-center group-hover:bg-gray-300 transition">
                  <span className="text-6xl">👕</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Product Name {item}</h4>
                <p className="text-gray-600 text-sm mb-2">Category</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">$49.99</span>
                  <span className="text-sm text-gray-500 line-through">$79.99</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-3">📰 Ticker Bar Widget</h3>
            <p className="mb-4">
              <strong>Try it:</strong> Look for the colorful bar sliding up from the bottom. 
              It appears briefly, then minimizes to the bottom-right. Click to record feedback!
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-yellow-300">Best for:</strong> E-commerce, consumer apps, high-traffic sites
              </div>
              <div>
                <strong className="text-yellow-300">Style:</strong> Eye-catching, animated, playful
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

