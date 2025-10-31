'use client';

import { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'planned' | 'building' | 'shipped';
  priority: string | null;
  ai_suggested_priority: string | null;
  feedback_count: number;
  is_public: boolean;
  created_at: string;
  ai_generated?: boolean;
  generation_source?: {
    feedback_ids: string[];
    reasoning: string;
    confidence: number;
  };
  feedback?: any[];
  scores?: {
    demand: number;
    differentiation: number;
    value: number;
    implementation: number;
    strategic_fit: number;
    virality: number;
    implied_need: number;
    enterprise_blocker: boolean;
    effort_hours: number | null;
    quick_win_score: number;
    traditional_score: number;
    differentiation_score: number;
    gray_area_score: number;
    enterprise_score: number;
    viral_score: number;
    last_scored_at: string | null;
    ai_insight: string | null;
  };
}

interface RoadmapViewProps {
  client: any;
}

const statusColumns = [
  { id: 'new', label: 'New', color: 'bg-gray-100 border-gray-300' },
  { id: 'planned', label: 'Planned', color: 'bg-blue-50 border-blue-300' },
  { id: 'building', label: 'Building', color: 'bg-purple-50 border-purple-300' },
  { id: 'shipped', label: 'Shipped', color: 'bg-green-50 border-green-300' }
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

type Framework = 'traditional' | 'differentiation' | 'gray_area' | 'quick_wins' | 'enterprise' | 'viral';

const frameworks = [
  { id: 'traditional', label: '📊 Traditional', description: 'Build what customers want, weighted by effort' },
  { id: 'differentiation', label: '🚀 Differentiation', description: 'Build unique features that create moat' },
  { id: 'gray_area', label: '🔍 Gray Area', description: 'Solve unstated problems' },
  { id: 'quick_wins', label: '⚡ Quick Wins', description: 'Maximum impact per hour' },
  { id: 'enterprise', label: '🏢 Enterprise', description: 'Unlock big customers' },
  { id: 'viral', label: '📈 Viral Growth', description: 'Features that make users share' }
];

export default function RoadmapView({ client }: RoadmapViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [framework, setFramework] = useState<Framework>('traditional');
  const [scoring, setScoring] = useState<string | null>(null);
  const [batchScoring, setBatchScoring] = useState(false);
  const [generatingGrayArea, setGeneratingGrayArea] = useState(false);

  useEffect(() => {
    if (client.id !== 'all') {
      fetchTickets();
    }
  }, [client.id]);

  const fetchTickets = async () => {
    setLoading(true);
    const response = await fetch(`/api/tickets?clientId=${client.id}`);
    const data = await response.json();
    setTickets(data.tickets || []);
    setLoading(false);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      fetchTickets();
    }
  };

  const updateTicketPriority = async (ticketId: string, newPriority: string) => {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority })
    });

    if (response.ok) {
      fetchTickets();
    }
  };

  const handleDragStart = (ticket: Ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newStatus: string) => {
    if (draggedTicket && draggedTicket.status !== newStatus) {
      updateTicketStatus(draggedTicket.id, newStatus);
    }
    setDraggedTicket(null);
  };

  const viewTicketDetails = async (ticketId: string) => {
    const response = await fetch(`/api/tickets/${ticketId}`);
    const data = await response.json();
    setSelectedTicket(data.ticket);
  };

  const scoreTicket = async (ticketId: string) => {
    setScoring(ticketId);
    try {
      const response = await fetch('/api/tickets/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId })
      });
      if (response.ok) {
        fetchTickets(); // Refresh to show updated scores
      } else {
        alert('❌ Failed to score ticket');
      }
    } catch (error) {
      console.error('Scoring error:', error);
      alert('❌ Error scoring ticket');
    } finally {
      setScoring(null);
    }
  };

  const batchScoreAll = async () => {
    setBatchScoring(true);
    try {
      const response = await fetch('/api/tickets/score', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id })
      });
      if (response.ok) {
        alert('✅ All tickets scored!');
        fetchTickets();
      } else {
        alert('❌ Batch scoring failed');
      }
    } catch (error) {
      console.error('Batch scoring error:', error);
      alert('❌ Error batch scoring');
    } finally {
      setBatchScoring(false);
    }
  };

  const generateGrayAreaTickets = async () => {
    setGeneratingGrayArea(true);
    try {
      const response = await fetch('/api/tickets/generate-gray-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✅ Generated ${data.generated} gray area tickets! Check the "New" column.`);
        fetchTickets();
      } else {
        alert(`❌ ${data.error || 'Failed to generate tickets'}`);
      }
    } catch (error) {
      console.error('Gray area generation error:', error);
      alert('❌ Error generating tickets');
    } finally {
      setGeneratingGrayArea(false);
    }
  };

  const getFrameworkScore = (ticket: Ticket): number => {
    if (!ticket.scores) return 0;
    const scoreMap = {
      traditional: ticket.scores.traditional_score,
      differentiation: ticket.scores.differentiation_score,
      gray_area: ticket.scores.gray_area_score,
      quick_wins: ticket.scores.quick_win_score,
      enterprise: ticket.scores.enterprise_score,
      viral: ticket.scores.viral_score
    };
    return scoreMap[framework] || 0;
  };

  // Sort tickets by framework score within each column
  const getSortedTickets = (statusTickets: Ticket[]) => {
    return [...statusTickets].sort((a, b) => getFrameworkScore(b) - getFrameworkScore(a));
  };

  if (client.id === 'all') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Select a specific client to view their product roadmap</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading roadmap...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🚀 Product Roadmap</h2>
        <p className="text-indigo-100">
          Voice feedback automatically organized into tickets by AI. Drag cards to update status.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="bg-white/20 px-3 py-1 rounded-full">
            {tickets.length} Total Tickets
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            {tickets.filter(t => t.status === 'shipped').length} Shipped
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            {tickets.reduce((sum, t) => sum + t.feedback_count, 0)} Voice Submissions
          </div>
        </div>
      </div>

      {/* Framework Selector & Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prioritization Framework:
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {frameworks.map(f => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {frameworks.find(f => f.id === framework)?.description}
            </p>
          </div>
          <div className="flex gap-2">
            {framework === 'gray_area' && (
              <button
                onClick={generateGrayAreaTickets}
                disabled={generatingGrayArea}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:bg-gray-400 text-sm font-medium transition-colors shadow-md"
              >
                {generatingGrayArea ? '⏳ Generating...' : '🤖 Generate New Tickets'}
              </button>
            )}
            <button
              onClick={batchScoreAll}
              disabled={batchScoring}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
            >
              {batchScoring ? '⏳ Scoring...' : '🔄 Score All Tickets'}
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnTickets = tickets.filter(t => t.status === column.id);
          
          return (
            <div
              key={column.id}
              className={`rounded-lg border-2 p-4 min-h-[500px] ${column.color}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{column.label}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-semibold">
                  {columnTickets.length}
                </span>
              </div>

              <div className="space-y-3">
                {getSortedTickets(columnTickets).map((ticket) => {
                  const score = getFrameworkScore(ticket);
                  const hasScores = ticket.scores && ticket.scores.last_scored_at;
                  
                  return (
                    <div
                      key={ticket.id}
                      draggable
                      onDragStart={() => handleDragStart(ticket)}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move hover:border-purple-300"
                      >
                        {/* AI Generated Badge */}
                        {ticket.ai_generated && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold border border-purple-200">
                              🤖 AI Generated
                            </span>
                            {ticket.generation_source?.confidence && (
                              <span className="text-xs text-gray-500">
                                {Math.round(ticket.generation_source.confidence * 100)}% confident
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div 
                          className="flex items-start justify-between mb-2"
                          onClick={() => viewTicketDetails(ticket.id)}
                        >
                          <h4 className="font-semibold text-sm text-gray-900 flex-1">
                            {ticket.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            {hasScores && score > 0 && (
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                score >= 8 ? 'bg-green-100 text-green-800' :
                                score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {score.toFixed(1)}
                              </span>
                            )}
                            {ticket.feedback_count > 0 && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">
                                {ticket.feedback_count} 🎤
                              </span>
                            )}
                          </div>
                        </div>

                      {ticket.description && (
                        <p 
                          className="text-xs text-gray-600 mb-3 line-clamp-2"
                          onClick={() => viewTicketDetails(ticket.id)}
                        >
                          {ticket.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {(ticket.priority || ticket.ai_suggested_priority) && (
                            <span className={`text-xs px-2 py-1 rounded ${priorityColors[(ticket.priority || ticket.ai_suggested_priority) as keyof typeof priorityColors]}`}>
                              {ticket.priority || `AI: ${ticket.ai_suggested_priority}`}
                            </span>
                          )}
                          {ticket.is_public && (
                            <span className="text-xs text-gray-500">🌐 Public</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scoreTicket(ticket.id);
                          }}
                          disabled={scoring === ticket.id}
                          className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 disabled:opacity-50"
                        >
                          {scoring === ticket.id ? '⏳' : '🔄'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.title}</h2>
                  <p className="text-gray-600">{selectedTicket.description}</p>
                  
                  {/* AI Generation Info */}
                  {selectedTicket.ai_generated && selectedTicket.generation_source && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-700 font-semibold text-sm">🤖 AI-Generated Ticket</span>
                        <span className="text-xs text-purple-600">
                          {Math.round(selectedTicket.generation_source.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>AI Reasoning:</strong> {selectedTicket.generation_source.reasoning}
                      </p>
                      <p className="text-xs text-gray-500">
                        Generated from {selectedTicket.generation_source.feedback_ids?.length || 0} feedback entries
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4">
                {/* Status Selector */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      updateTicketStatus(selectedTicket.id, e.target.value);
                      setSelectedTicket({ ...selectedTicket, status: e.target.value as any });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                  >
                    {statusColumns.map(col => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                  <select
                    value={selectedTicket.priority || ''}
                    onChange={(e) => {
                      updateTicketPriority(selectedTicket.id, e.target.value);
                      setSelectedTicket({ ...selectedTicket, priority: e.target.value });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                  >
                    <option value="">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {selectedTicket.ai_suggested_priority && !selectedTicket.priority && (
                  <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm">
                    <span className="text-blue-600 font-medium">
                      💡 AI suggests: {selectedTicket.ai_suggested_priority}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Feedback List */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Voice Feedback ({selectedTicket.feedback?.length || 0})
              </h3>
              <div className="space-y-4">
                {selectedTicket.feedback && selectedTicket.feedback.length > 0 ? (
                  selectedTicket.feedback.map((fb: any) => (
                    <div key={fb.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{fb.cleaned_transcript}</p>
                          {fb.sentiment && (
                            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                              fb.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              fb.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {fb.sentiment}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {fb.audio_url && (
                        <audio controls src={fb.audio_url} className="w-full mt-2" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No voice feedback yet for this ticket.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

