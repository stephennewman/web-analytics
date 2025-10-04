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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>('');

  const handleSendTestEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('');
    try {
      const response = await fetch('/api/send-digest', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setEmailStatus('✅ Test email sent! Check your inbox.');
      } else {
        setEmailStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setEmailStatus('❌ Failed to send email');
    } finally {
      setSendingEmail(false);
      setTimeout(() => setEmailStatus(''), 5000);
    }
  };

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
            <div className="flex items-center gap-3">
              {emailStatus && (
                <span className="text-sm text-gray-600">{emailStatus}</span>
              )}
              <button
                onClick={handleSendTestEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingEmail ? '📧 Sending...' : '📧 Send Test Email'}
              </button>
            </div>
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

