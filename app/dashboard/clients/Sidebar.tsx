'use client';

import { useState, useEffect } from 'react';

interface SidebarProps {
  email: string;
  activeView: string;
  onViewChange: (view: string) => void;
  clientId?: string;
}

export default function Sidebar({ email, activeView, onViewChange, clientId }: SidebarProps) {
  const [liveVisitorCount, setLiveVisitorCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for live visitor count
  useEffect(() => {
    if (!clientId || clientId === 'all') return;

    const pollLiveVisitors = async () => {
      try {
        const response = await fetch(`/api/live-visitors?clientId=${clientId}`);
        const data = await response.json();
        if (response.ok) {
          setLiveVisitorCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching live visitors:', error);
      }
    };

    // Poll immediately, then every 30 seconds
    pollLiveVisitors();
    const interval = setInterval(pollLiveVisitors, 30000);
    setIsPolling(true);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [clientId]);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐝</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Trackerbee
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'dashboard'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">📊</span>
          Dashboard
        </button>
        <button
          onClick={() => onViewChange('live')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'live'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            {isPolling && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <span className="flex-1 text-left">Live</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            liveVisitorCount > 0 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {liveVisitorCount}
          </span>
        </button>
        <button
          onClick={() => onViewChange('visitors')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'visitors'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">👥</span>
          Visitors
        </button>
        <button
          onClick={() => onViewChange('insights')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'insights'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">💡</span>
          Insights
        </button>
        <button
          onClick={() => onViewChange('feedback')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'feedback'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">🎙️</span>
          Feedback
        </button>

        <button
          onClick={() => onViewChange('roadmap')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'roadmap'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">🚀</span>
          Roadmap
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'settings'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">⚙️</span>
          Settings
        </button>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black text-sm font-medium">
            {email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{email}</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-left cursor-pointer">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

