'use client';

import { BeeSwarm } from '@/components/BeeSwarm';

interface SidebarProps {
  email: string;
  activeView: string;
  onViewChange: (view: string) => void;
  clientId?: string;
}

export default function Sidebar({ email, activeView, onViewChange, clientId }: SidebarProps) {

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r-2 border-zinc-800 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b-2 border-zinc-800 bg-black">
        <div className="flex items-center gap-2">
          <BeeSwarm size="sm" count={3} animated={false} />
          <h1 className="text-xl font-bold text-gradient-gold">
            Trackerbeez
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        <button
          onClick={() => onViewChange('live')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'live'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">📡</span>
          <span className="flex-1 text-left">Live</span>
        </button>
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'dashboard'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">📊</span>
          Dashboard
        </button>
        <button
          onClick={() => onViewChange('visitors')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'visitors'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">👥</span>
          Visitors
        </button>
        <button
          onClick={() => onViewChange('insights')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'insights'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">💡</span>
          Insights
        </button>
        <button
          onClick={() => onViewChange('feedback')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'feedback'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">🎙️</span>
          Feedback
        </button>

        <button
          onClick={() => onViewChange('roadmap')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'roadmap'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">🚀</span>
          Roadmap
        </button>
        <button
          onClick={() => onViewChange('sessions')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'sessions'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">🎬</span>
          Sessions
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'settings'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(212,175,55,0.3)] hover:-translate-y-0.5'
              : 'text-zinc-300 hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
          }`}
        >
          <span className="text-lg">⚙️</span>
          Settings
        </button>
      </nav>

      {/* User info */}
      <div className="p-4 border-t-2 border-zinc-800">
        <form action="/api/auth/signout" method="post">
          <button className="w-full text-sm text-zinc-400 hover:text-zinc-100 py-2 px-3 rounded-lg hover:bg-zinc-800 transition-colors text-left cursor-pointer">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

