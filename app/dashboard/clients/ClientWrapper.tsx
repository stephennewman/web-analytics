'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import SetupView from './SetupView';
import AddSiteForm from './AddSiteForm';

interface ClientWrapperProps {
  email: string;
  client: any;
  clients: any[];
  sessions: any[];
  stats: any;
}

export default function ClientWrapper({ email, client, clients, sessions, stats }: ClientWrapperProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [showAddSiteForm, setShowAddSiteForm] = useState(false);

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

  const handleSiteAdded = (newSite: any) => {
    // Refresh the page to show the new site
    window.location.reload();
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
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 capitalize">{activeView}</h1>
              
              {/* Site Switcher */}
              {clients.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Site:</span>
                  <select 
                    value={client.id}
                    onChange={(e) => {
                      const selectedClient = clients.find(c => c.id === e.target.value);
                      if (selectedClient) {
                        window.location.href = `/dashboard/clients?site=${selectedClient.id}`;
                      }
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.domain && `(${c.domain})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {emailStatus && (
                <span className="text-sm text-gray-600">{emailStatus}</span>
              )}
              <button
                onClick={() => setShowAddSiteForm(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Site
              </button>
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

      {/* Add Site Form Modal */}
      {showAddSiteForm && (
        <AddSiteForm
          onSiteAdded={handleSiteAdded}
          onClose={() => setShowAddSiteForm(false)}
        />
      )}
    </div>
  );
}

