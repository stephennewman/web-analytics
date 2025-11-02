/**
 * Trackerbeez Design System - Black & Gold Edition
 * Bold, luxurious, and data-focused
 */

export const designConfig = {
  boldnessLevel: 2, // Balanced - Bold & Beautiful
  
  borders: {
    1: { default: '1px', thick: '2px', card: '1px' },
    2: { default: '2px', thick: '3px', card: '2px' },
    3: { default: '3px', thick: '5px', card: '4px' },
  },
  
  shadows: {
    1: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    2: {
      // Gold glow shadows
      sm: '2px 2px 0px rgba(212, 175, 55, 0.3)',
      md: '4px 4px 0px rgba(212, 175, 55, 0.25)',
      lg: '6px 6px 0px rgba(212, 175, 55, 0.2)',
      glow: '0 0 20px rgba(212, 175, 55, 0.4)',
    },
    3: {
      sm: '3px 3px 0px rgba(212, 175, 55, 0.5)',
      md: '6px 6px 0px rgba(212, 175, 55, 0.4)',
      lg: '10px 10px 0px rgba(212, 175, 55, 0.3)',
      glow: '0 0 30px rgba(212, 175, 55, 0.6)',
    },
  },
  
  radius: {
    1: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' },
    2: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },
    3: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
  },
  
  colors: {
    1: { // Professional
      primary: { bg: 'bg-zinc-900', text: 'text-white', hover: 'hover:bg-zinc-800' },
      accent: { bg: 'bg-yellow-600', text: 'text-white', hover: 'hover:bg-yellow-500' },
      success: { bg: 'bg-emerald-600', text: 'text-white', hover: 'hover:bg-emerald-700' },
      danger: { bg: 'bg-red-600', text: 'text-white', hover: 'hover:bg-red-700' },
    },
    2: { // Balanced (Black & Gold)
      primary: { bg: 'bg-black', text: 'text-white', hover: 'hover:bg-zinc-900', border: 'border-zinc-800' },
      accent: { bg: 'bg-yellow-600', text: 'text-black', hover: 'hover:bg-yellow-500', border: 'border-yellow-700' },
      success: { bg: 'bg-emerald-500', text: 'text-white', hover: 'hover:bg-emerald-600', border: 'border-emerald-600' },
      danger: { bg: 'bg-red-500', text: 'text-white', hover: 'hover:bg-red-600', border: 'border-red-600' },
      neutral: { bg: 'bg-zinc-800', text: 'text-zinc-100', hover: 'hover:bg-zinc-700', border: 'border-zinc-700' },
    },
    3: { // Bold
      primary: { bg: 'bg-black', text: 'text-yellow-400', hover: 'hover:bg-zinc-950', border: 'border-yellow-600' },
      accent: { bg: 'bg-yellow-400', text: 'text-black', hover: 'hover:bg-yellow-500', border: 'border-yellow-600' },
      success: { bg: 'bg-emerald-400', text: 'text-black', hover: 'hover:bg-emerald-500', border: 'border-black' },
      danger: { bg: 'bg-red-400', text: 'text-black', hover: 'hover:bg-red-500', border: 'border-black' },
    },
  },
};

export const getDesignTokens = () => {
  const level = designConfig.boldnessLevel as 1 | 2 | 3;
  return {
    border: designConfig.borders[level],
    shadow: designConfig.shadows[level],
    radius: designConfig.radius[level],
    colors: designConfig.colors[level],
  };
};

// CARDS - Black backgrounds with gold accents
export const getCardClass = () => {
  const level = designConfig.boldnessLevel;
  
  if (level === 1) {
    return 'bg-zinc-900 rounded-lg border border-zinc-800 shadow-sm';
  } else if (level === 2) {
    // Bold & Beautiful - Black card with gold border accent
    return 'bg-zinc-900 rounded-lg border-2 border-zinc-800 shadow-[2px_2px_0px_rgba(212,175,55,0.2)] hover:shadow-[4px_4px_0px_rgba(212,175,55,0.3)] transition-shadow';
  } else {
    return 'bg-black rounded-md border-4 border-yellow-600 shadow-[6px_6px_0px_rgba(212,175,55,0.4)]';
  }
};

// BUTTONS - Gold primary, black secondary
export const getButtonClass = (variant: 'primary' | 'secondary' | 'accent' | 'ghost' = 'primary') => {
  const level = designConfig.boldnessLevel;
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200';
  
  if (level === 1) {
    if (variant === 'primary') return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-500`;
    if (variant === 'accent') return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-500`;
    if (variant === 'ghost') return `${baseClasses} bg-transparent text-zinc-300 hover:bg-zinc-800`;
    return `${baseClasses} bg-zinc-800 text-zinc-100 hover:bg-zinc-700`;
  } else if (level === 2) {
    // Bold & Beautiful
    if (variant === 'primary') {
      return `${baseClasses} bg-gradient-to-br from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.4)] hover:-translate-y-0.5`;
    }
    if (variant === 'accent') {
      return `${baseClasses} bg-yellow-600 text-black hover:bg-yellow-500 border-2 border-yellow-700 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]`;
    }
    if (variant === 'ghost') {
      return `${baseClasses} bg-transparent text-zinc-300 hover:bg-zinc-800/50 border-2 border-transparent hover:border-zinc-700`;
    }
    return `${baseClasses} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border-2 border-zinc-700`;
  } else {
    // Maximum boldness
    if (variant === 'primary') {
      return `${baseClasses} bg-yellow-400 text-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]`;
    }
    return `${baseClasses} bg-black text-yellow-400 hover:translate-y-[2px] border-4 border-yellow-600 shadow-[6px_6px_0px_rgba(212,175,55,0.6)]`;
  }
};

// BADGES - Metal colors with gold highlights
export const getBadgeClass = (variant: 'default' | 'success' | 'warning' | 'error' | 'gold' = 'default') => {
  const level = designConfig.boldnessLevel;
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold';
  
  if (level === 2) {
    // Bold & Beautiful
    if (variant === 'gold') return `${baseClasses} bg-yellow-600 text-black border-2 border-yellow-700`;
    if (variant === 'success') return `${baseClasses} bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/30`;
    if (variant === 'warning') return `${baseClasses} bg-amber-500/20 text-amber-300 border-2 border-amber-500/30`;
    if (variant === 'error') return `${baseClasses} bg-red-500/20 text-red-300 border-2 border-red-500/30`;
    return `${baseClasses} bg-zinc-800 text-zinc-300 border-2 border-zinc-700`;
  }
  
  // Fallback for other levels
  if (variant === 'gold') return `${baseClasses} bg-yellow-600 text-white`;
  if (variant === 'success') return `${baseClasses} bg-emerald-100 text-emerald-800`;
  if (variant === 'warning') return `${baseClasses} bg-amber-100 text-amber-800`;
  if (variant === 'error') return `${baseClasses} bg-red-100 text-red-800`;
  return `${baseClasses} bg-zinc-100 text-zinc-800`;
};

// INPUT FIELDS - Dark with gold focus
export const getInputClass = () => {
  const level = designConfig.boldnessLevel;
  
  if (level === 2) {
    return 'w-full px-4 py-2.5 bg-zinc-900 text-zinc-100 border-2 border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 placeholder-zinc-500 transition-colors';
  }
  
  return 'w-full px-4 py-2.5 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-600 placeholder-zinc-500';
};

// METRIC DISPLAY - For analytics numbers
export const getMetricClass = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };
  
  return `${sizes[size]} font-mono font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600`;
};

// SECTION HEADER
export const getSectionHeaderClass = () => {
  return 'text-xl font-sans font-bold text-zinc-100 mb-4';
};
