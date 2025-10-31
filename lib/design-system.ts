/**
 * Design System Configuration
 * 
 * Adjust these values to control the "boldness" level of the UI
 * Level 1 = Minimal/Professional (default)
 * Level 2 = Balanced
 * Level 3 = Bold/Neobrutalism
 */

export const designConfig = {
  // Current boldness level (1-3)
  boldnessLevel: 2,
  
  // Border widths
  borders: {
    1: { default: '1px', thick: '2px', card: '1px' },
    2: { default: '2px', thick: '3px', card: '2px' },
    3: { default: '3px', thick: '5px', card: '4px' },
  },
  
  // Shadow styles
  shadows: {
    1: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    2: {
      sm: '2px 2px 0px rgba(0,0,0,1)',
      md: '4px 4px 0px rgba(0,0,0,1)',
      lg: '6px 6px 0px rgba(0,0,0,1)',
    },
    3: {
      sm: '3px 3px 0px rgba(0,0,0,1)',
      md: '6px 6px 0px rgba(0,0,0,1)',
      lg: '10px 10px 0px rgba(0,0,0,1)',
    },
  },
  
  // Border radius
  radius: {
    1: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' }, // 6px, 8px, 12px
    2: { sm: '0.5rem', md: '0.75rem', lg: '1rem' },     // 8px, 12px, 16px
    3: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },  // 4px, 8px, 12px (sharper for neo)
  },
  
  // Colors (can be overridden for more boldness)
  colors: {
    1: { // Professional
      primary: { bg: 'bg-purple-600', text: 'text-white', hover: 'hover:bg-purple-700' },
      accent: { bg: 'bg-yellow-500', text: 'text-black', hover: 'hover:bg-yellow-600' },
      success: { bg: 'bg-green-600', text: 'text-white', hover: 'hover:bg-green-700' },
      danger: { bg: 'bg-red-600', text: 'text-white', hover: 'hover:bg-red-700' },
    },
    2: { // Balanced
      primary: { bg: 'bg-purple-500', text: 'text-white', hover: 'hover:bg-purple-600' },
      accent: { bg: 'bg-yellow-400', text: 'text-black', hover: 'hover:bg-yellow-500' },
      success: { bg: 'bg-green-500', text: 'text-white', hover: 'hover:bg-green-600' },
      danger: { bg: 'bg-red-500', text: 'text-white', hover: 'hover:bg-red-600' },
    },
    3: { // Bold/Neobrutalism
      primary: { bg: 'bg-purple-400', text: 'text-black', hover: 'hover:bg-purple-500' },
      accent: { bg: 'bg-yellow-300', text: 'text-black', hover: 'hover:bg-yellow-400' },
      success: { bg: 'bg-green-400', text: 'text-black', hover: 'hover:bg-green-500' },
      danger: { bg: 'bg-red-400', text: 'text-black', hover: 'hover:bg-red-500' },
    },
  },
};

// Helper to get current design tokens
export const getDesignTokens = () => {
  const level = designConfig.boldnessLevel as 1 | 2 | 3;
  return {
    border: designConfig.borders[level],
    shadow: designConfig.shadows[level],
    radius: designConfig.radius[level],
    colors: designConfig.colors[level],
  };
};

// Helper classes for consistent styling
export const getCardClass = () => {
  const tokens = getDesignTokens();
  const level = designConfig.boldnessLevel;
  
  if (level === 1) {
    return 'bg-white rounded-lg border border-gray-200 shadow-sm';
  } else if (level === 2) {
    return 'bg-white rounded-lg border-2 border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]';
  } else {
    return 'bg-white rounded-md border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]';
  }
};

export const getButtonClass = (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
  const tokens = getDesignTokens();
  const level = designConfig.boldnessLevel;
  
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all';
  
  if (level === 1) {
    // Professional
    if (variant === 'primary') return `${baseClasses} bg-purple-600 text-white hover:bg-purple-700`;
    if (variant === 'accent') return `${baseClasses} bg-yellow-500 text-black hover:bg-yellow-600`;
    return `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`;
  } else if (level === 2) {
    // Balanced
    if (variant === 'primary') return `${baseClasses} bg-purple-500 text-white hover:bg-purple-600 border-2 border-purple-700`;
    if (variant === 'accent') return `${baseClasses} bg-yellow-400 text-black hover:bg-yellow-500 border-2 border-yellow-600`;
    return `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-300`;
  } else {
    // Bold/Neobrutalism
    if (variant === 'primary') return `${baseClasses} bg-purple-400 text-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]`;
    if (variant === 'accent') return `${baseClasses} bg-yellow-300 text-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]`;
    return `${baseClasses} bg-white text-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]`;
  }
};

export const getBadgeClass = (variant: 'default' | 'success' | 'warning' | 'error' = 'default') => {
  const level = designConfig.boldnessLevel;
  
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  if (level === 1) {
    // Professional
    if (variant === 'success') return `${baseClasses} bg-green-100 text-green-800`;
    if (variant === 'warning') return `${baseClasses} bg-yellow-100 text-yellow-800`;
    if (variant === 'error') return `${baseClasses} bg-red-100 text-red-800`;
    return `${baseClasses} bg-gray-100 text-gray-800`;
  } else if (level === 2) {
    // Balanced
    if (variant === 'success') return `${baseClasses} bg-green-200 text-green-900 border-2 border-green-400`;
    if (variant === 'warning') return `${baseClasses} bg-yellow-200 text-yellow-900 border-2 border-yellow-400`;
    if (variant === 'error') return `${baseClasses} bg-red-200 text-red-900 border-2 border-red-400`;
    return `${baseClasses} bg-gray-200 text-gray-900 border-2 border-gray-400`;
  } else {
    // Bold/Neobrutalism
    if (variant === 'success') return `${baseClasses} bg-green-300 text-black border-2 border-black`;
    if (variant === 'warning') return `${baseClasses} bg-yellow-300 text-black border-2 border-black`;
    if (variant === 'error') return `${baseClasses} bg-red-300 text-black border-2 border-black`;
    return `${baseClasses} bg-white text-black border-2 border-black`;
  }
};

