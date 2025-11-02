'use client';

import { useEffect, useState, useRef } from 'react';

// Extend Window for rrweb player
declare global {
  interface Window {
    rrwebPlayer: any;
  }
}

interface SessionRecording {
  id: string;
  session_id: string;
  visitor_id: string;
  url: string;
  page_title: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
  viewport_width: number;
  viewport_height: number;
  device_type: string;
  events: any[];
  events_count: number;
  has_rage_click: boolean;
  has_error: boolean;
}

interface SessionsViewProps {
  client: any;
}

export default function SessionsView({ client }: SessionsViewProps) {
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (client.id !== 'all') {
      fetchRecordings();
    }
  }, [client.id]);

  // Load rrweb-player CSS and JS when modal opens
  useEffect(() => {
    if (selectedRecording && !playerLoaded) {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js';
      script.onload = () => {
        setPlayerLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, [selectedRecording, playerLoaded]);

  // Initialize player when loaded
  useEffect(() => {
    if (playerLoaded && selectedRecording && playerContainerRef.current && window.rrwebPlayer) {
      // Clean up previous instance
      if (playerInstanceRef.current) {
        playerContainerRef.current.innerHTML = '';
      }

      // Create new player
      playerInstanceRef.current = new window.rrwebPlayer({
        target: playerContainerRef.current,
        props: {
          events: selectedRecording.events,
          autoPlay: false,
          showController: true,
          speed: 1,
        },
      });
    }
  }, [playerLoaded, selectedRecording]);

  async function fetchRecordings() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/record?clientId=${client.id}`);
      const data = await res.json();
      setRecordings(data.recordings || []);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
    setLoading(false);
  }

  function formatDuration(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  if (client.id === 'all') {
    return (
      <div className="p-6">
        <p className="text-gray-500">Please select a specific site to view session recordings.</p>
      </div>
    );
  }

  // Check if session recording is disabled
  if (!client.session_recording_enabled) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Session Recording Disabled</h3>
          <p className="text-gray-600 mb-6">
            Enable session recording to watch user sessions and identify UX issues.
          </p>
          <button
            onClick={() => window.location.href = `/dashboard/clients?site=${client.id}&view=settings`}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-all"
          >
            Enable in Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-2">🎬 Session Recordings</h2>
        <p className="text-gray-600">
          Watch how users interact with your site. All recordings are privacy-masked.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <span className="font-semibold text-purple-700">{recordings.length}</span> Total Recordings
          </div>
          <div className="bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <span className="font-semibold text-red-700">
              {recordings.filter(r => r.has_rage_click).length}
            </span> Rage Clicks Detected
          </div>
          <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            <span className="font-semibold text-orange-700">
              {recordings.filter(r => r.has_error).length}
            </span> With Errors
          </div>
        </div>
      </div>

      {/* Recordings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading recordings...</div>
        </div>
      ) : recordings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📹</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recordings yet</h3>
          <p className="text-gray-600">
            Recordings will appear here once visitors browse your site with the tracking script installed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 p-6 cursor-pointer transition-all"
              onClick={() => setSelectedRecording(recording)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {recording.page_title || recording.url}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{recording.url}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>⏱️ {formatDuration(recording.duration_ms)}</span>
                    <span>📱 {recording.device_type}</span>
                    <span>📐 {recording.viewport_width}×{recording.viewport_height}</span>
                    <span>🎞️ {recording.events_count} events</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {recording.has_rage_click && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                        🔥 Rage Click
                      </span>
                    )}
                    {recording.has_error && (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                        ⚠️ JS Error
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">{formatDate(recording.started_at)}</div>
                  <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">
                    ▶️ Watch Replay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Replay Modal */}
      {selectedRecording && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedRecording(null);
            if (playerInstanceRef.current) {
              playerContainerRef.current!.innerHTML = '';
              playerInstanceRef.current = null;
            }
          }}
        >
          <div
            className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRecording.page_title || 'Session Replay'}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedRecording.url}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>⏱️ {formatDuration(selectedRecording.duration_ms)}</span>
                    <span>📱 {selectedRecording.device_type}</span>
                    <span>📐 {selectedRecording.viewport_width}×{selectedRecording.viewport_height}</span>
                    <span>📅 {formatDate(selectedRecording.started_at)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedRecording(null);
                    if (playerInstanceRef.current) {
                      playerContainerRef.current!.innerHTML = '';
                      playerInstanceRef.current = null;
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Player Container */}
            <div className="p-6">
              {!playerLoaded ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Loading player...</div>
                </div>
              ) : (
                <div ref={playerContainerRef} className="bg-gray-100 rounded-lg overflow-hidden" />
              )}
            </div>

            {/* Privacy Notice */}
            <div className="px-6 pb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                🔒 <strong>Privacy Protected:</strong> All sensitive data (passwords, emails, phone numbers) is automatically masked in this recording.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

