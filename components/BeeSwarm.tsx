/**
 * BeeSwarm Component - Multiple animated bees for Trackerbeez branding
 * Shows a swarm of 3 bees to represent "Trackerbeez" (plural)
 */

interface BeeSwarmProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  count?: number;
}

export function BeeSwarm({ size = 'md', animated = true, count = 3 }: BeeSwarmProps) {
  const sizes = {
    sm: { container: 'w-12 h-8', bee: 'text-base', gap: '-ml-1' },
    md: { container: 'w-20 h-12', bee: 'text-2xl', gap: '-ml-2' },
    lg: { container: 'w-32 h-16', bee: 'text-4xl', gap: '-ml-3' },
  };

  const s = sizes[size];
  const bees = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`relative inline-flex items-center justify-center ${s.container}`}>
      {bees.map((i) => (
        <span
          key={i}
          className={`${s.bee} ${s.gap} ${
            animated ? 'animate-bounce' : ''
          }`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: animated ? `${2 + i * 0.2}s` : undefined,
            transform: `rotate(${-10 + i * 10}deg)`,
            zIndex: count - i,
          }}
        >
          🐝
        </span>
      ))}
    </div>
  );
}

/**
 * SVG Bee Icon - Cleaner alternative to emoji
 */
interface BeeSVGProps {
  size?: number;
  color?: string;
  className?: string;
}

export function BeeSVG({ size = 24, color = 'currentColor', className = '' }: BeeSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bee body stripes */}
      <ellipse cx="12" cy="14" rx="5" ry="7" fill="#FCD34D" />
      <rect x="8" y="11" width="8" height="2" fill="#000" />
      <rect x="8" y="15" width="8" height="2" fill="#000" />
      
      {/* Wings */}
      <ellipse cx="8" cy="10" rx="4" ry="5" fill="#E0E7FF" opacity="0.6" transform="rotate(-30 8 10)" />
      <ellipse cx="16" cy="10" rx="4" ry="5" fill="#E0E7FF" opacity="0.6" transform="rotate(30 16 10)" />
      
      {/* Head */}
      <circle cx="12" cy="8" r="3" fill="#FCD34D" />
      
      {/* Antennae */}
      <line x1="10" y1="6" x2="9" y2="4" stroke="#000" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="6" x2="15" y2="4" stroke="#000" strokeWidth="1" strokeLinecap="round" />
      <circle cx="9" cy="4" r="1" fill="#000" />
      <circle cx="15" cy="4" r="1" fill="#000" />
      
      {/* Stinger */}
      <path d="M12 21 L11 23 L12 24 L13 23 Z" fill="#000" />
    </svg>
  );
}

/**
 * BeeSwarm SVG - Multiple SVG bees
 */
interface BeeSwarmSVGProps {
  count?: number;
  size?: number;
  animated?: boolean;
}

export function BeeSwarmSVG({ count = 3, size = 24, animated = true }: BeeSwarmSVGProps) {
  const bees = Array.from({ length: count }, (_, i) => i);
  
  return (
    <div className="relative inline-flex items-center gap-1">
      {bees.map((i) => (
        <div
          key={i}
          className={animated ? 'animate-bounce' : ''}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: animated ? `${2 + i * 0.2}s` : undefined,
          }}
        >
          <BeeSVG size={size} className="text-yellow-500" />
        </div>
      ))}
    </div>
  );
}

