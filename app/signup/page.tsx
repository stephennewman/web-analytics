'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { getCardClass, getButtonClass, getInputClass } from '@/lib/design-system';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [bees, setBees] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);
  const router = useRouter();
  const supabase = createClient();

  // Generate flying bees on mount
  useEffect(() => {
    const beeCount = 8;
    const generatedBees = Array.from({ length: beeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4
    }));
    setBees(generatedBees);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage('🎉 Hive ready! Buzzing you to the dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Honeycomb Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="honeycomb" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
              <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="currentColor" strokeWidth="1" className="text-yellow-500"/>
              <path d="M28 0L28 34L0 50L0 16L28 0" fill="none" stroke="currentColor" strokeWidth="1" className="text-yellow-500"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb)" />
        </svg>
      </div>

      {/* Flying Bees */}
      {bees.map((bee) => (
        <div
          key={bee.id}
          className="absolute text-2xl animate-float pointer-events-none"
          style={{
            left: `${bee.x}%`,
            top: `${bee.y}%`,
            animationDelay: `${bee.delay}s`,
            animationDuration: `${bee.duration}s`,
            opacity: 0.6
          }}
        >
          🐝
        </div>
      ))}

          <div className={`max-w-md w-full space-y-8 p-8 ${getCardClass()} relative z-10 backdrop-blur-sm`}>
            <div className="text-center">
              {/* Animated Bee Swarm Logo */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <BeeSwarm size="lg" count={3} />
                <div>
                  <h1 className="text-5xl font-bold text-gradient-gold">
                    Trackerbeez
                  </h1>
                  <p className="text-xs text-yellow-500 font-medium mt-1">Where insights hive together</p>
                </div>
              </div>
          
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">Join the Hive! 🍯</h2>
          <p className="text-lg text-zinc-300 font-medium">
            Create your account and start <span className="text-yellow-500">bee-ing</span> productive
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/30 text-red-300 px-4 py-3 rounded-lg font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg font-medium animate-pulse">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-yellow-400 mb-2">
                📧 Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`${getInputClass()} placeholder-zinc-600`}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-yellow-400 mb-2">
                🔐 Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={`${getInputClass()} placeholder-zinc-600`}
              />
              <p className="text-xs text-zinc-500 mt-1">Make it strong enough to keep the bugs out! 🐛</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-4 px-4 text-lg font-bold ${getButtonClass('primary')} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group`}
          >
            <span className="relative z-10">
              {loading ? (
                <>
                  <span className="animate-spin inline-block">🔄</span> Creating your hive...
                </>
              ) : (
                <>
                  🚀 Join the Swarm!
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>

          <div className="text-center pt-4 border-t-2 border-zinc-800">
            <p className="text-sm text-zinc-400 mb-2">Already part of the colony?</p>
            <a href="/login" className="text-base text-yellow-500 hover:text-yellow-400 font-bold hover:underline transition-colors inline-flex items-center gap-1">
              🐝 Buzz back in
            </a>
          </div>
        </form>

        {/* Fun Facts */}
        <div className="mt-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg">
          <p className="text-xs text-zinc-400 text-center">
            💡 <span className="text-yellow-400 font-semibold">Bee Fact:</span> A bee visits 50-100 flowers per trip. 
            <br className="sm:hidden" /> Track that many visitors with Trackerbeez! 🌸
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) rotate(5deg);
          }
          50% {
            transform: translate(-10px, 20px) rotate(-5deg);
          }
          75% {
            transform: translate(-20px, -10px) rotate(5deg);
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
