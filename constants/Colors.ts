// Gen-Z Dark Theme Color Palette
const Colors = {
  dark: {
    // Base colors
    background: '#0a0a0b',           // Deep black background
    surface: '#1a1a1b',             // Card/surface backgrounds
    surfaceVariant: '#2a2a2b',      // Elevated surfaces
    
    // Text colors
    text: '#ffffff',                // Primary text
    textSecondary: '#a3a3a3',       // Secondary text
    textMuted: '#999999',           // Muted text (lighter for better visibility)
    
    // Accent colors - Gen-Z vibrant palette
    electricBlue: '#00d4ff',        // Primary brand color
    neonGreen: '#00ff88',           // Success/positive actions
    purpleGlow: '#8b5cf6',          // Secondary accent
    pinkFlash: '#ff6b9d',           // Attention/highlights
    
    // Status colors
    success: '#00ff88',
    warning: '#ffab00',
    error: '#ff4757',
    info: '#00d4ff',
    
    // Interactive states
    primary: '#00d4ff',
    primaryHover: '#00b8e6',
    secondary: '#8b5cf6',
    secondaryHover: '#7c3aed',
    
    // UI elements
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    borderAccent: 'rgba(0, 212, 255, 0.3)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    inputBorderFocused: 'rgba(0, 212, 255, 0.6)',
    tabIconDefault: '#666666',
    tabIconSelected: '#00d4ff',
    tint: '#00d4ff',
    
    // Gradients for modern effects
    gradientPrimary: ['#00d4ff', '#8b5cf6'] as const,
    gradientSecondary: ['#ff6b9d', '#00ff88'] as const,
    gradientDark: ['#0a0a0b', '#1a1a1b'] as const,
  },
  
  // Keep light theme minimal for now
  light: {
    text: '#000000',
    background: '#ffffff',
    tint: '#00d4ff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#00d4ff',
  },
};

export default Colors;
