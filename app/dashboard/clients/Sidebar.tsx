'use client';

interface SidebarProps {
  email: string;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ email, activeView, onViewChange }: SidebarProps) {

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Analytics
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'dashboard'
              ? 'bg-purple-50 text-purple-700'
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
              ? 'bg-purple-50 text-purple-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">🔴</span>
          Live
        </button>
        <button
          onClick={() => onViewChange('visitors')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'visitors'
              ? 'bg-purple-50 text-purple-700'
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
              ? 'bg-purple-50 text-purple-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">💡</span>
          Insights
        </button>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
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

