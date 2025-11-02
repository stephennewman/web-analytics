import Link from 'next/link';
import { getButtonClass } from '@/lib/design-system';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <BeeSwarm size="lg" count={3} />
        </div>
        <h1 className="text-6xl font-bold text-gradient-gold mb-4">
          Trackerbeez
        </h1>
        <p className="text-2xl text-zinc-300 max-w-2xl mx-auto font-medium">
          Buzz through your conversion problems. 
          <span className="text-yellow-500"> See why visitors don't convert</span> and what to fix.
        </p>
        <div className="flex gap-4 justify-center mt-12">
          <Link
            href="/signup"
            className={getButtonClass('primary')}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className={getButtonClass('secondary')}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
