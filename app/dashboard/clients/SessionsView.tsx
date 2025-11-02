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
  const [showFiltered, setShowFiltered] = useState(false);
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

      // Create new player with autoplay
      playerInstanceRef.current = new window.rrwebPlayer({
        target: playerContainerRef.current,
        props: {
          events: selectedRecording.events,
          autoPlay: true,
          showController: true,
          speed: 1,
          width: 800,
          height: 600,
        },
      });

      // Ensure autoplay starts after a brief delay (helps with some browsers)
      setTimeout(() => {
        if (playerInstanceRef.current && playerInstanceRef.current.play) {
          playerInstanceRef.current.play();
        }
      }, 100);
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

  // Filter out low-quality sessions
  function isQualitySession(recording: SessionRecording) {
    // Filter criteria for junk sessions:
    // - Less than 15 seconds duration (was 5, but too many short useless recordings)
    // - Less than 15 events
    const MIN_DURATION_MS = 15000;
    const MIN_EVENTS = 15;
    
    return recording.duration_ms >= MIN_DURATION_MS && recording.events_count >= MIN_EVENTS;
  }

  const qualityRecordings = showFiltered 
    ? recordings 
    : recordings.filter(isQualitySession);
  
  const filteredCount = recordings.length - qualityRecordings.length;

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
        <h2 className="text-2xl font-bold mb-2 text-gray-900">🎬 Session Recordings</h2>
        <p className="text-gray-700">
          Watch how users interact with your site. All recordings are privacy-masked.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm items-center">
          <div className="bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <span className="font-semibold text-purple-700">{qualityRecordings.length}</span> <span className="text-gray-800 font-medium">Quality Recordings</span>
          </div>
          <div className="bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <span className="font-semibold text-red-700">
              {recordings.filter(r => r.has_rage_click).length}
            </span> <span className="text-gray-800 font-medium">Rage Clicks Detected</span>
          </div>
          <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            <span className="font-semibold text-orange-700">
              {recordings.filter(r => r.has_error).length}
            </span> <span className="text-gray-800 font-medium">With Errors</span>
          </div>
          {filteredCount > 0 && (
            <>
              <div className="bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                <span className="font-semibold text-gray-600">{filteredCount}</span> <span className="text-gray-700 font-medium">Filtered (low quality)</span>
              </div>
              <button
                onClick={() => setShowFiltered(!showFiltered)}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-colors"
              >
                {showFiltered ? '✓ Showing All' : 'Show Filtered'}
              </button>
            </>
          )}
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
      ) : qualityRecordings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All recordings filtered</h3>
          <p className="text-gray-600 mb-4">
            All {recordings.length} recording(s) were filtered out (less than 15 seconds or 15 events).
          </p>
          <button
            onClick={() => setShowFiltered(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            Show Filtered Recordings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {qualityRecordings.map((recording) => (
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
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedRecording(null);
            if (playerInstanceRef.current) {
              playerContainerRef.current!.innerHTML = '';
              playerInstanceRef.current = null;
            }
          }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-6xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compact Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {selectedRecording.page_title || 'Session Replay'}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  <span>⏱️ {formatDuration(selectedRecording.duration_ms)}</span>
                  <span>📱 {selectedRecording.device_type}</span>
                  <span>📐 {selectedRecording.viewport_width}×{selectedRecording.viewport_height}</span>
                </div>
              </div>
            </div>

            {/* Player Container with Close Button Overlay */}
            <div className="relative">
              {/* Floating Close Button - Always visible on top right */}
              <button
                onClick={() => {
                  setSelectedRecording(null);
                  if (playerInstanceRef.current) {
                    playerContainerRef.current!.innerHTML = '';
                    playerInstanceRef.current = null;
                  }
                }}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-colors"
                title="Close replay"
              >
                ✕
              </button>

              <div className="p-6">
                {!playerLoaded ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-400">Loading player...</div>
                  </div>
                ) : (
                  <div ref={playerContainerRef} className="bg-gray-100 rounded-lg overflow-hidden" />
                )}
              </div>
            </div>

            {/* Compact Privacy Notice */}
            <div className="px-6 pb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                🔒 <strong>Privacy Protected:</strong> Sensitive data is automatically masked in this recording.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

