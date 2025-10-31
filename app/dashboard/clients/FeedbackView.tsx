'use client';

import { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

interface Feedback {
  id: string;
  audio_url: string;
  url: string;
  duration: number;
  transcript: string;
  cleaned_transcript: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  themes: string[];
  insights: string;
  status: string;
  created_at: string;
  ticket_id?: string;
  sessions: {
    session_id: string;
    country: string;
    city: string;
    region: string;
    device_type: string;
    time_spent: number;
    pageviews: number;
    clicks: number;
    converted: boolean;
    has_intent: boolean;
    landing_page: string;
    referrer: string;
  };
}

export default function FeedbackView({ clientId }: { clientId: string }) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [creatingTicket, setCreatingTicket] = useState<string | null>(null);
  
  useEffect(() => {
    fetchFeedback();
  }, [clientId]);
  
  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback/list?clientId=${clientId}`);
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (feedbackId: string) => {
    setCreatingTicket(feedbackId);
    try {
      const response = await fetch('/api/feedback/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✅ Ticket ${data.action === 'created' ? 'created' : 'linked'}!`);
        fetchFeedback(); // Refresh to show updated ticket_id
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('❌ Failed to create ticket');
    } finally {
      setCreatingTicket(null);
    }
  };
  
  const filteredFeedback = filter === 'all' 
    ? feedback 
    : feedback.filter(f => f.sentiment === filter);
  
  const sentimentColors = {
    positive: 'bg-green-100 text-green-700 border-green-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    negative: 'bg-red-100 text-red-700 border-red-200'
  };

  const sentimentEmoji = {
    positive: '😊',
    neutral: '😐',
    negative: '😞'
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Voice Feedback</h2>
        <div className="flex gap-2">
          {(['all', 'positive', 'neutral', 'negative'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                filter === f
                  ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Feedback cards */}
      <div className="space-y-4">
        {filteredFeedback.map(item => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {item.sentiment && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${sentimentColors[item.sentiment]}`}>
                      {sentimentEmoji[item.sentiment]}{' '}
                      {item.sentiment}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()} • {item.duration}s
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>📱 {item.sessions?.device_type || 'Unknown'}</span>
                  {item.sessions?.city && <span>📍 {item.sessions.city}, {item.sessions.country}</span>}
                  <span className="truncate max-w-md">🔗 {item.url}</span>
                </div>
                {item.sessions && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-3 text-gray-600">
                      <span>👁️ {item.sessions.pageviews} pages viewed</span>
                      <span>⏱️ {Math.floor(item.sessions.time_spent / 60)}m on site</span>
                      <span>🔗 Landing: {new URL(item.sessions.landing_page).pathname}</span>
                      {item.sessions.converted && <span className="text-green-600">✓ Converted</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Audio player */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <AudioPlayer 
                src={item.audio_url}
                className="w-full"
              />
            </div>
            
            {/* Transcript */}
            {item.status === 'completed' && item.cleaned_transcript && (
              <>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Transcript:</h4>
                  <p className="text-sm text-gray-600 italic">"{item.cleaned_transcript}"</p>
                </div>
                
                {/* Themes */}
                {item.themes && item.themes.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Themes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.themes.map((theme, i) => (
                        <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-800 text-xs rounded-full border border-yellow-200">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Insights */}
                {item.insights && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 Insight:</h4>
                    <p className="text-sm text-blue-800">{item.insights}</p>
                  </div>
                )}

                {/* Ticket Status / Create Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {item.ticket_id ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 font-medium">✓ Linked to ticket</span>
                      <button
                        onClick={() => window.location.href = '/dashboard/clients?view=roadmap'}
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        View in Roadmap →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => createTicket(item.id)}
                      disabled={creatingTicket === item.id}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      {creatingTicket === item.id ? '⏳ Creating Ticket...' : '🎫 Create Roadmap Ticket'}
                    </button>
                  )}
                </div>
              </>
            )}
            
            {item.status === 'transcribing' && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                ⏳ Transcribing audio...
              </div>
            )}
            
            {item.status === 'pending' && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                ⏳ Waiting to transcribe...
              </div>
            )}
            
            {item.status === 'failed' && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-800">
                ❌ Transcription failed
              </div>
            )}

            {/* Link to session */}
            {item.sessions && (
              <button
                onClick={() => {
                  window.location.href = `?site=${clientId}&view=visitors&session=${item.sessions.session_id}`;
                }}
                className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 underline cursor-pointer"
              >
                View full session →
              </button>
            )}
          </div>
        ))}
      </div>
      
      {filteredFeedback.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎙️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No Feedback Yet' : `No ${filter} feedback`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Voice feedback from visitors will appear here once submitted.'
              : `No feedback with ${filter} sentiment yet.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

