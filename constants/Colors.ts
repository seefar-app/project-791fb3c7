export const Colors = {
  light: {
    // Primary - Coral/Pink (Brand)
    primary: '#ec4899',
    primaryLight: '#f9a8d4',
    primaryDark: '#be185d',
    
    // Secondary - Orange
    secondary: '#fed7aa',
    secondaryDark: '#f97316',
    
    // Accent - Yellow
    accent: '#facc15',
    accentLight: '#fef08a',
    accentDark: '#ca8a04',
    
    // Background
    background: '#ffffff',
    backgroundSecondary: '#fff7ed',
    backgroundTertiary: '#fdf2f8',
    
    // Text
    text: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    
    // Semantic
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    
    // UI Elements
    border: '#f3f4f6',
    borderDark: '#e5e7eb',
    card: '#ffffff',
    cardHover: '#fdf2f8',
    
    // Tier Colors
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    
    // Gradients
    gradientStart: '#ec4899',
    gradientMiddle: '#f43f5e',
    gradientEnd: '#fb7185',
  },
  dark: {
    // Primary - Coral/Pink (Brand)
    primary: '#f472b6',
    primaryLight: '#fce7f3',
    primaryDark: '#db2777',
    
    // Secondary - Orange
    secondary: '#431407',
    secondaryDark: '#fb923c',
    
    // Accent - Yellow
    accent: '#fbbf24',
    accentLight: '#fef3c7',
    accentDark: '#d97706',
    
    // Background
    background: '#0f0f0f',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#262626',
    
    // Text
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    textInverse: '#1f2937',
    
    // Semantic
    success: '#34d399',
    successLight: '#064e3b',
    warning: '#fbbf24',
    warningLight: '#78350f',
    error: '#f87171',
    errorLight: '#7f1d1d',
    info: '#60a5fa',
    infoLight: '#1e3a8a',
    
    // UI Elements
    border: '#374151',
    borderDark: '#4b5563',
    card: '#1f1f1f',
    cardHover: '#2a2a2a',
    
    // Tier Colors
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    
    // Gradients
    gradientStart: '#db2777',
    gradientMiddle: '#e11d48',
    gradientEnd: '#f43f5e',
  },
};

export const Gradients = {
  primary: ['#ec4899', '#f43f5e', '#fb7185'] as const,
  warm: ['#f97316', '#fb923c', '#fbbf24'] as const,
  sunset: ['#ec4899', '#f97316', '#facc15'] as const,
  coral: ['#fb7185', '#f472b6', '#c084fc'] as const,
  gold: ['#fbbf24', '#f59e0b', '#d97706'] as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
};