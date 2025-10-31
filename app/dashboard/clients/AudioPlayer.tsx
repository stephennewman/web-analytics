'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export default function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  const handleError = () => {
    setError(true);
    console.error('Audio playback error:', src);
  };

  const handleCanPlay = () => {
    setError(false);
  };

  // On mobile, hide the player if there's an error and show a message
  if (isMobile && error) {
    return (
      <div className={`${className} p-3 bg-gray-100 rounded-lg border border-gray-300`}>
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <span>📱</span>
          Audio playback not available on mobile. Transcript shown above.
        </p>
      </div>
    );
  }

  // On mobile, show a simpler message if no error yet
  if (isMobile) {
    return (
      <div className={className}>
        <audio 
          ref={audioRef}
          controls 
          src={src}
          onError={handleError}
          onCanPlay={handleCanPlay}
          className="w-full h-10"
          preload="metadata"
        />
        <p className="text-xs text-gray-500 mt-1 text-center">
          If playback fails, the transcript is shown above
        </p>
      </div>
    );
  }

  // Desktop: Show normal audio player with error fallback
  if (error) {
    return (
      <div className={`${className} p-3 bg-red-50 rounded-lg border border-red-200`}>
        <p className="text-xs text-red-700 flex items-center gap-2">
          <span>⚠️</span>
          Audio playback error. Transcript available above.
        </p>
      </div>
    );
  }

  return (
    <audio 
      ref={audioRef}
      controls 
      src={src}
      onError={handleError}
      onCanPlay={handleCanPlay}
      className={className}
      preload="metadata"
    />
  );
}

