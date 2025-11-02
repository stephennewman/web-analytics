'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { getCardClass, getButtonClass, getInputClass } from '@/lib/design-system';
import { BeeSwarm } from '@/components/BeeSwarm';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Subtle Honeycomb Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="honeycomb-subtle" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
              <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb-subtle)" />
        </svg>
      </div>

          <div className={`max-w-md w-full space-y-8 p-8 ${getCardClass()} relative z-10 backdrop-blur-sm`}>
            <div className="text-center">
              {/* Logo with bee swarm */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <BeeSwarm size="lg" count={3} />
                <div>
                  <h1 className="text-4xl font-bold text-gradient-gold">
                    Trackerbeez
                  </h1>
                  <p className="text-xs text-yellow-600 font-medium mt-1">Analytics that stick</p>
                </div>
              </div>
          
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Welcome Back</h2>
          <p className="text-base text-zinc-400 font-medium">
            Sign in to access your hive
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/30 text-red-300 px-4 py-3 rounded-lg font-medium">
              ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-yellow-500 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`${getInputClass()} placeholder-zinc-600 focus:ring-yellow-500/30`}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-yellow-500 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={`${getInputClass()} placeholder-zinc-600 focus:ring-yellow-500/30`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-3 px-4 text-base font-semibold ${getButtonClass('primary')} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
          >
            {loading ? (
              <>
                <span className="animate-spin">🔄</span> Signing in...
              </>
            ) : (
              <>
                🐝 Sign in
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t-2 border-zinc-800">
            <p className="text-sm text-zinc-400 mb-2">New to Trackerbeez?</p>
            <a href="/signup" className="text-base text-yellow-500 hover:text-yellow-400 font-semibold hover:underline transition-colors">
              Create an account →
            </a>
          </div>
        </form>

        {/* Subtle bee-themed quote */}
        <div className="mt-6 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-500 text-center italic">
            "The hum of bees is the voice of the garden." 🌻
          </p>
        </div>
      </div>
    </div>
  );
}
