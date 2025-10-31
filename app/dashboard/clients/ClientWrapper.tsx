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
  initialView?: string;
}

export default function ClientWrapper({ email, client, clients, sessions, stats, initialView }: ClientWrapperProps) {
  const [activeView, setActiveView] = useState(initialView || 'dashboard');
  const [showAddSiteForm, setShowAddSiteForm] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDomain, setEditingDomain] = useState('');
  const [editingFilters, setEditingFilters] = useState({ enabled: true, patterns: ['localhost', '127.0.0.1', 'test.', 'staging.'] });

  const handleSiteAdded = (newSite: any) => {
    // Refresh the page to show the new site
    window.location.reload();
  };

  const handleEditSite = (site: any) => {
    setEditingSiteId(site.id);
    setEditingName(site.name);
    setEditingDomain(site.domain || '');
    setEditingFilters(site.url_filters || { enabled: true, patterns: ['localhost', '127.0.0.1', 'test.', 'staging.'] });
  };

  const handleSaveEdit = async () => {
    if (!editingSiteId || !editingName.trim()) return;

    console.log('Saving site edit:', {
      siteId: editingSiteId,
      name: editingName.trim(),
      domain: editingDomain.trim()
    });

    try {
      const response = await fetch(`/api/clients/${editingSiteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingName.trim(),
          domain: editingDomain.trim(),
          url_filters: editingFilters,
        }),
      });

      const data = await response.json();
      console.log('API response:', { status: response.status, data });

      if (response.ok) {
        // Refresh the page to show updated site name
        window.location.reload();
      } else {
        alert(`❌ Error updating site: ${data.error}${data.details ? ` (${data.details})` : ''}`);
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('❌ Failed to update site');
    } finally {
      setEditingSiteId(null);
      setEditingName('');
      setEditingDomain('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSiteId(null);
    setEditingName('');
    setEditingDomain('');
    setEditingFilters({ enabled: true, patterns: ['localhost', '127.0.0.1', 'test.', 'staging.'] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar email={email} activeView={activeView} onViewChange={setActiveView} clientId={client.id} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 capitalize">{activeView}</h1>
              
              {/* Site Switcher */}
              {clients.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Site:</span>
                  <div className="flex items-center gap-1">
                    <select 
                      value={client.id}
                      onChange={(e) => {
                        const currentView = activeView;
                        if (e.target.value === 'all') {
                          window.location.href = `/dashboard/clients?site=all&view=${currentView}`;
                        } else {
                          const selectedClient = clients.find(c => c.id === e.target.value);
                          if (selectedClient) {
                            window.location.href = `/dashboard/clients?site=${selectedClient.id}&view=${currentView}`;
                          }
                        }
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {clients.length > 1 && (
                        <option value="all">🌐 All Sites</option>
                      )}
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.domain && `(${c.domain})`}
                        </option>
                      ))}
                    </select>
                    
                    {/* Edit button for current site (not for "All Sites" view) */}
                    {client.id !== 'all' && (
                      <button
                        onClick={() => handleEditSite(client)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit site name"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddSiteForm(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Site
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <SetupView 
            client={client}
            clients={clients}
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

      {/* Edit Site Modal */}
      {editingSiteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Site</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter site name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain (optional)
                </label>
                <input
                  type="text"
                  value={editingDomain}
                  onChange={(e) => setEditingDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="example.com"
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="filterEnabled"
                    checked={editingFilters.enabled}
                    onChange={(e) => setEditingFilters({...editingFilters, enabled: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="filterEnabled" className="text-sm font-medium text-gray-700">
                    Filter out unwanted traffic
                  </label>
                </div>
                <div className="ml-6">
                  <label className="block text-xs text-gray-600 mb-1">
                    URLs to filter (one per line)
                  </label>
                  <textarea
                    value={editingFilters.patterns.join('\n')}
                    onChange={(e) => setEditingFilters({...editingFilters, patterns: e.target.value.split('\n').filter(p => p.trim())})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="localhost&#10;127.0.0.1&#10;test.&#10;staging."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Any URL containing these patterns will be filtered out
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editingName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

