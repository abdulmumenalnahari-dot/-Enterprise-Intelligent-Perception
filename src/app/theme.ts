export type StateColors = {
  satisfaction: { high: string; medium: string; low: string };
  attention: { high: string; medium: string; low: string };
  stress: { low: string; medium: string; high: string };
  risk: { none: string; low: string; medium: string; high: string; critical: string };
  system: { online: string; offline: string; warning: string; error: string };
};

export type CustomTheme = {
  primary: string;
  accent: string;
  background: string;
  card: string;
};

export const baseColors = {
  white: '#ffffff',
  black: '#000000'
} as const;

export const defaultCustomTheme: CustomTheme = {
  primary: '#d4af37',
  accent: '#13daec',
  background: '#f6f8f8',
  card: '#ffffff'
};

export const defaultStateColors: StateColors = {
  satisfaction: {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444'
  },
  attention: {
    high: '#3b82f6',
    medium: '#8b5cf6',
    low: '#6b7280'
  },
  stress: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  },
  risk: {
    none: '#10b981',
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#dc2626'
  },
  system: {
    online: '#10b981',
    offline: '#6b7280',
    warning: '#f59e0b',
    error: '#ef4444'
  }
};

export const goldStateColors: StateColors = {
  satisfaction: {
    high: '#fbbf24',
    medium: '#f59e0b',
    low: '#ea580c'
  },
  attention: {
    high: '#fbbf24',
    medium: '#d97706',
    low: '#78716c'
  },
  stress: {
    low: '#fbbf24',
    medium: '#f59e0b',
    high: '#ea580c'
  },
  risk: {
    none: '#fbbf24',
    low: '#f59e0b',
    medium: '#f97316',
    high: '#ea580c',
    critical: '#dc2626'
  },
  system: {
    online: '#fbbf24',
    offline: '#78716c',
    warning: '#f59e0b',
    error: '#ea580c'
  }
};

export const highContrastColors: StateColors = {
  satisfaction: {
    high: '#00ff00',
    medium: '#ffff00',
    low: '#ff0000'
  },
  attention: {
    high: '#00ffff',
    medium: '#ff00ff',
    low: '#808080'
  },
  stress: {
    low: '#00ff00',
    medium: '#ffff00',
    high: '#ff0000'
  },
  risk: {
    none: '#00ff00',
    low: '#00ffff',
    medium: '#ffff00',
    high: '#ff8800',
    critical: '#ff0000'
  },
  system: {
    online: '#00ff00',
    offline: '#808080',
    warning: '#ffff00',
    error: '#ff0000'
  }
};

export const presetPalettes = {
  gold: {
    light: {
      background: '#f6f2e8',
      card: '#ffffff',
      primary: '#d4af37',
      accent: '#13daec'
    },
    dark: {
      background: '#0f1b1d',
      card: '#0a1415',
      primary: '#d4af37',
      accent: '#13daec'
    }
  },
  highContrast: {
    light: {
      background: '#ffffff',
      card: '#f5f5f5',
      primary: '#0a1415',
      accent: '#ffb700'
    },
    dark: {
      background: '#000000',
      card: '#0f1114',
      primary: '#ffb700',
      accent: '#00e5ff'
    }
  }
} as const;

// LoginScreen
export const loginColors = {
  text: '#0a1415',
  background: '#f6f8f8',
  backgroundDark: '#102022',
  backgroundLayerDark: '#0a1415',
  gridDot: 'rgba(19, 218, 236, 0.05)',
  primaryGlow: 'rgba(19, 218, 236, 0.05)',
  goldGlow: 'rgba(212, 175, 55, 0.05)',
  accent: '#D4AF37',
  accentShadow: 'rgba(212, 175, 55, 0.3)',
  inputDark: 'rgba(10, 20, 21, 0.6)',
  inputLight: 'rgba(255, 255, 255, 0.7)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  placeholderLight: 'rgba(0, 0, 0, 0.3)',
  placeholderDark: 'rgba(255, 255, 255, 0.3)',
  iconLight: 'rgba(0, 0, 0, 0.6)',
  iconDark: 'rgba(255, 255, 255, 0.4)',
  linkAccent: 'rgba(212, 175, 55, 0.8)',
  mfaBg: 'rgba(212, 175, 55, 0.05)',
  mfaBorder: 'rgba(212, 175, 55, 0.1)',
  fingerprint: '#13daec'
} as const;

// OnboardingScreen
export const onboardingColors = {
  text: '#0a1415',
  backgroundDark: 'radial-gradient(circle at center, #151e32 0%, #0d1321 100%)',
  backgroundLight: 'radial-gradient(circle at center, #f4f7ff 0%, #e9eefb 100%)',
  accent: '#D4AF37',
  slideColors: ['#13daec', '#e6b964', '#2dd4bf'],
  dotDark: '#263042',
  dotLight: '#cbd5f0',
  headerBorderLight: 'rgba(0, 0, 0, 0.1)',
  headerBorderDark: 'rgba(255, 255, 255, 0.1)',
  headerIconLight: 'rgba(0, 0, 0, 0.7)',
  headerIconDark: 'rgba(255, 255, 255, 0.7)'
} as const;

// SetupWizard (deployment selection)
export const setupWizardColors = {
  textLight: '#0b1220',
  backgroundDark: 'radial-gradient(circle at center, #151e32 0%, #0d1321 100%)',
  backgroundLight: 'radial-gradient(circle at center, #f4f7ff 0%, #e9eefb 100%)',
  stepActiveGradient: 'linear-gradient(90deg, #d4a017 0%, #f6d365 100%)',
  stepActiveText: '#000000',
  cardGradientDark: 'linear-gradient(180deg, rgba(35,45,65,0.8) 0%, rgba(20,25,40,0.8) 100%)',
  cardGradientLight: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(240,244,255,0.85) 100%)',
  selectedCardLight: 'rgba(240, 248, 255, 0.92)',
  selectedCardLightShadow: '0 0 18px rgba(0, 160, 170, 0.35)',
  selectedCardLightBorder: 'rgba(0, 160, 170, 0.55)',
  selectedCardDark: 'rgba(30, 41, 59, 0.6)',
  selectedCardDarkShadow: '0 0 15px rgba(45, 212, 191, 0.5)',
  selectedCardDarkBorder: '#2dd4bf',
  lightText300: 'rgba(15,23,42,0.72)',
  lightText400: 'rgba(15,23,42,0.5)',
  lightBorder600: 'rgba(15,23,42,0.15)',
  lightBorder700: 'rgba(15,23,42,0.18)',
  logoShadow: 'drop-shadow(0 8px 18px rgba(15,23,42,0.18))',
  accent: '#D4AF37',
  titleGold: '#e6b964',
  actionCancel: '#6b7280',
  actionCancelHover: '#9ca3af',
  actionCancelText: '#ffffff',
  actionNextText: '#111827',
  actionNextRing: '#e6b964',
  headerBorderLight: 'rgba(0, 0, 0, 0.1)',
  headerBorderDark: 'rgba(255, 255, 255, 0.1)',
  headerIconLight: 'rgba(0, 0, 0, 0.7)',
  headerIconDark: 'rgba(255, 255, 255, 0.7)',
  focusOffsetDark: '#0d1321',
  focusOffsetLight: '#ffffff'
} as const;

// SetupConfigurationWizard (multi-step setup)
export const setupConfigColors = {
  text: '#0a1415',
  backgroundDark: 'radial-gradient(circle at center, #151e32 0%, #0d1321 100%)',
  backgroundLight: 'radial-gradient(circle at center, #f4f7ff 0%, #e9eefb 100%)',
  accent: '#D4AF37',
  accentBorder: 'rgba(212, 175, 55, 0.55)',
  accentSoft: 'rgba(212, 175, 55, 0.2)',
  accentSoftAlt: 'rgba(212, 175, 55, 0.18)',
  surfaceLight: 'rgba(255, 255, 255, 0.7)',
  surfaceDark: 'rgba(10, 20, 21, 0.5)',
  inputLight: 'rgba(255, 255, 255, 0.7)',
  inputDark: 'rgba(10, 20, 21, 0.6)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  placeholderLight: 'rgba(0, 0, 0, 0.3)',
  placeholderDark: 'rgba(255, 255, 255, 0.3)',
  sliderInactive: 'rgb(203, 187, 187)',
  sliderThumb: '#ffffff',
  sliderShadow: '0 0 0 3px rgba(212, 175, 55, 0.18)',
  buttonShadow: '0 0 15px rgba(212,175,55,0.3)',
  switchOffLight: 'rgba(10, 20, 21, 0.15)',
  headerBorderLight: 'rgba(0, 0, 0, 0.1)',
  headerBorderDark: 'rgba(255, 255, 255, 0.1)',
  headerIconLight: 'rgba(0, 0, 0, 0.7)',
  headerIconDark: 'rgba(255, 255, 255, 0.7)',
  mutedLabelLight: 'rgba(0, 0, 0, 0.5)',
  mutedLabelDark: 'rgba(255, 255, 255, 0.5)',
  backButtonBg: '#6b7280',
  backButtonHover: '#9ca3af',
  backButtonText: '#ffffff',
  summaryTileDark: 'rgba(10, 20, 21, 0.25)',
  summaryTileLight: 'rgba(10, 20, 21, 0.22)'
} as const;

// Layout (top bar / scroll button)
export const layoutColors = {
  accent: '#D4AF37',
  scrollButtonBorderLight: 'rgba(0, 0, 0, 0.1)',
  scrollButtonBorderDark: 'rgba(255, 255, 255, 0.1)',
  scrollButtonBgLight: 'rgba(255, 255, 255, 0.8)',
  scrollButtonBgDark: 'rgba(10, 20, 21, 0.8)',
  scrollButtonTextLight: 'rgba(0, 0, 0, 0.7)',
  scrollButtonTextDark: 'rgba(255, 255, 255, 0.7)',
  sidebarItemBgLight: 'rgba(10, 20, 21, 0.08)',
  sidebarItemBgDark: 'rgba(255, 255, 255, 0.08)',
  sidebarActiveBgLight: 'rgba(212, 175, 55, 0.26)',
  sidebarActiveBgDark: 'rgba(212, 175, 55, 0.38)',
  sidebarHoverBgLight: 'rgba(19, 218, 236, 0.18)',
  sidebarHoverBgDark: 'rgba(19, 218, 236, 0.24)',
  sidebarActiveBorderLight: 'rgba(212, 175, 55, 0.65)',
  sidebarActiveBorderDark: 'rgba(212, 175, 55, 0.82)'
} as const;

// Dashboard
export const dashboardColors = {
  panelLight: 'rgba(30, 41, 59, 0.6)',
  panelDark: 'rgba(30, 41, 59, 0.6)',
  panelSoftLight: 'rgba(30, 41, 59, 0.6)',
  panelSoftDark: 'rgba(30, 41, 59, 0.6)'
} as const;

// Analytics
export const analyticsColors = {
  exportLight: '#f6f8f8',
  exportDark: '#0a1415'
} as const;

// CameraFeed (canvas overlays)
export const cameraFeedColors = {
  overlayBg: 'rgba(10, 20, 21, 0.92)',
  overlayText: '#f6f8f8',
  overlayMuted: '#9fb0b2',
  overlayLabel: '#dbe5e6',
  fpsText: 'rgba(246,248,248,0.85)'
} as const;

// SplashScreen
export const splashColors = {
  text: '#ffffff',
  background:
    'radial-gradient(900px 520px at 50% 32%, rgba(214,191,135,.16), rgba(0,0,0,0) 62%), radial-gradient(720px 520px at 60% 34%, rgba(46,124,131,.18), rgba(0,0,0,0) 60%), radial-gradient(1400px 900px at 50% 52%, rgba(255,255,255,.028), rgba(0,0,0,0) 68%), linear-gradient(135deg, #0f141b, #141b24 55%, #0e131a)',
  overlay:
    'radial-gradient(1200px 900px at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,.42) 68%, rgba(0,0,0,.62) 100%)',
  logoGlow:
    'radial-gradient(70px 70px at 50% 50%, rgba(214,191,135,.22), rgba(0,0,0,0) 72%), radial-gradient(120px 90px at 63% 58%, rgba(46,124,131,.18), rgba(0,0,0,0) 74%)',
  logoShadow: 'drop-shadow(0 10px 28px rgba(0,0,0,.52))',
  title: '#d6bf87',
  titleShadow: '0 14px 40px rgba(0,0,0,.32)',
  tagline: 'rgba(214,191,135,.72)',
  progressText: 'rgba(118,185,179,.95)',
  progressShadow: '0 10px 20px rgba(0,0,0,.35)',
  barGradient:
    'linear-gradient(90deg, rgba(214,191,135,.11), rgba(46,124,131,.07) 62%, rgba(46,124,131,.10))',
  barBorder: 'rgba(46,124,131,.40)',
  barShadow: 'inset 0 0 0 1px rgba(0,0,0,.36), 0 10px 34px rgba(0,0,0,.28)',
  fillGradient:
    'linear-gradient(90deg, rgba(214,191,135,.98), rgba(197,168,109,.84) 55%, rgba(46,124,131,.52) 100%)',
  fillShadow: '0 0 18px rgba(118,185,179,.18)',
  shine:
    'radial-gradient(circle at 40% 40%, rgba(210,255,255,.80), rgba(120,240,240,.18) 45%, rgba(0,0,0,0) 72%)',
  dot: 'rgba(210,255,255,.92)',
  dotShadow:
    '0 0 0 3px rgba(46,124,131,.14), 0 0 18px rgba(120,240,240,.55), 0 0 36px rgba(46,124,131,.30)',
  statusPrimary: 'rgba(214,191,135,.78)',
  statusSecondary: 'rgba(244,246,248,.62)'
} as const;
