'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import SetupView from './SetupView';

interface ClientWrapperProps {
  email: string;
  client: any;
  sessions: any[];
  stats: any;
}

export default function ClientWrapper({ email, client, sessions, stats }: ClientWrapperProps) {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar email={email} activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-gray-900 capitalize">{activeView}</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <SetupView 
            client={client}
            sessions={sessions}
            stats={stats}
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </main>
      </div>
    </div>
  );
}

