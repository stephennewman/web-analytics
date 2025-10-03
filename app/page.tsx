import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-5xl font-bold text-gray-900">Web Analytics</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Conversion-focused analytics that tells you why visitors don't convert
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium border border-gray-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
