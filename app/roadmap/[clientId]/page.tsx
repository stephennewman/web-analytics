'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  feedback_count: number;
  is_public: boolean;
  created_at: string;
}

interface Client {
  name: string;
  domain: string;
}

const statusColumns = [
  { id: 'new', label: '🆕 New', description: 'Recently submitted requests' },
  { id: 'planned', label: '📋 Planned', description: 'On our roadmap' },
  { id: 'building', label: '🔨 Building', description: 'Currently in development' },
  { id: 'shipped', label: '✅ Shipped', description: 'Live and available' }
];

export default function PublicRoadmapPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicData();
  }, [clientId]);

  const fetchPublicData = async () => {
    setLoading(true);
    
    // Fetch public tickets
    const response = await fetch(`/api/tickets?clientId=${clientId}`);
    const data = await response.json();
    
    // Filter only public tickets
    const publicTickets = (data.tickets || []).filter((t: Ticket) => t.is_public !== false);
    setTickets(publicTickets);
    
    // Fetch client name (you'd need to add this API endpoint)
    const clientResponse = await fetch(`/api/clients/${clientId}`);
    const clientData = await clientResponse.json();
    setClient(clientData.client);
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Product Roadmap
          </h1>
          {client && (
            <p className="text-xl text-gray-600 mb-2">{client.name}</p>
          )}
          <p className="text-gray-500 max-w-2xl mx-auto">
            See what we're building. All feedback is collected via voice and automatically organized by AI.
          </p>
          <div className="mt-6 inline-flex gap-4">
            <div className="bg-white px-6 py-3 rounded-full shadow-sm">
              <span className="text-2xl font-bold text-purple-600">{tickets.length}</span>
              <span className="text-sm text-gray-600 ml-2">Tickets</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-sm">
              <span className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'shipped').length}
              </span>
              <span className="text-sm text-gray-600 ml-2">Shipped</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-sm">
              <span className="text-2xl font-bold text-blue-600">
                {tickets.reduce((sum, t) => sum + t.feedback_count, 0)}
              </span>
              <span className="text-sm text-gray-600 ml-2">Voice Requests</span>
            </div>
          </div>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusColumns.map((column) => {
            const columnTickets = tickets.filter(t => t.status === column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{column.label}</h3>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
                      {columnTickets.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{column.description}</p>
                </div>

                <div className="space-y-3">
                  {columnTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 flex-1">
                          {ticket.title}
                        </h4>
                        {ticket.feedback_count > 0 && (
                          <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">
                            {ticket.feedback_count} 🎤
                          </span>
                        )}
                      </div>

                      {ticket.description && (
                        <p className="text-xs text-gray-600 mb-3">
                          {ticket.description}
                        </p>
                      )}

                      {ticket.priority && (
                        <span className={`inline-block text-xs px-2 py-1 rounded ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                  ))}

                  {columnTickets.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No items yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Have feedback?</h3>
            <p className="text-gray-600 mb-4">
              Visit {client?.domain || 'our site'} to submit voice feedback and help shape our product!
            </p>
            <div className="flex justify-center gap-2 text-2xl">
              🎤 💬 🚀
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

