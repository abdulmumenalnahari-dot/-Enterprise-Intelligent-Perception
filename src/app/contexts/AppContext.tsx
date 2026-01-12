import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CustomTheme as ThemeCustomTheme, StateColors } from '../theme';
import {
  defaultCustomTheme,
  defaultStateColors,
  goldStateColors,
  highContrastColors,
  presetPalettes
} from '../theme';

export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
export type ColorPreset = 'default' | 'gold' | 'highContrast' | 'custom';
export type FontSize = 'small' | 'medium' | 'large' | 'extraLarge';
export type ContrastMode = 'normal' | 'high';
export type CustomTheme = ThemeCustomTheme;

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorPreset: ColorPreset;
  setColorPreset: (preset: ColorPreset) => void;
  customTheme: CustomTheme;
  setCustomTheme: (theme: CustomTheme) => void;
  appearanceSaved: { colorPreset: ColorPreset; customTheme: CustomTheme };
  saveAppearanceSettings: () => void;
  restoreAppearanceDefaults: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
  stateColors: StateColors;
  setStateColors: (colors: StateColors) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isSetupComplete: boolean;
  setIsSetupComplete: (complete: boolean) => void;
  selectedProfile: string | null;
  setSelectedProfile: (profile: string | null) => void;
  cameraCount: number;
  setCameraCount: (count: number) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  currentUserEmail: string | null;
  setCurrentUserEmail: (email: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isValidCustomTheme = (value: unknown): value is CustomTheme => {
  if (!value || typeof value !== 'object') return false;
  const theme = value as { primary?: unknown; accent?: unknown; background?: unknown; card?: unknown };
  return (
    typeof theme.primary === 'string' &&
    typeof theme.accent === 'string' &&
    typeof theme.background === 'string' &&
    typeof theme.card === 'string'
  );
};
const normalizeCustomTheme = (value: unknown): CustomTheme => {
  const theme = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    primary: typeof theme.primary === 'string' ? theme.primary : defaultCustomTheme.primary,
    accent: typeof theme.accent === 'string' ? theme.accent : defaultCustomTheme.accent,
    background: typeof theme.background === 'string' ? theme.background : defaultCustomTheme.background,
    card: typeof theme.card === 'string' ? theme.card : defaultCustomTheme.card
  };
};

const clamp = (value: number) => Math.max(0, Math.min(255, value));
const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  if (value.length !== 6) return null;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
};
const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`;
const mixHex = (a: string, b: string, ratio: number) => {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  const r = Math.round(ca.r + (cb.r - ca.r) * ratio);
  const g = Math.round(ca.g + (cb.g - ca.g) * ratio);
  const bch = Math.round(ca.b + (cb.b - ca.b) * ratio);
  return rgbToHex(r, g, bch);
};
const getReadableForeground = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#0a1415';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#0a1415' : '#f6f8f8';
};
const adjustForTheme = (hex: string, mode: Theme) => {
  if (mode === 'dark') {
    return mixHex(hex, '#0a1415', 0.7);
  }
  return hex;
};

const THEME_VAR_KEYS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--border',
  '--input-background',
  '--switch-background',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring'
] as const;

const buildThemeTokens = (base: { background: string; card: string; primary: string; accent: string }) => {
  const background = base.background;
  const foreground = getReadableForeground(background);
  const card = base.card;
  const cardForeground = getReadableForeground(card);
  const secondary = mixHex(card, background, 0.15);
  const muted = mixHex(card, background, 0.25);
  const mutedForeground = mixHex(foreground, background, 0.45);
  const border = mixHex(card, foreground, 0.15);
  const primaryForeground = getReadableForeground(base.primary);
  const accentForeground = getReadableForeground(base.accent);
  const chart3 = mixHex(base.accent, base.primary, 0.45);
  const chart4 = mixHex(base.primary, background, 0.25);
  const chart5 = mixHex(base.accent, background, 0.35);

  return {
    '--background': background,
    '--foreground': foreground,
    '--card': card,
    '--card-foreground': cardForeground,
    '--popover': card,
    '--popover-foreground': cardForeground,
    '--primary': base.primary,
    '--primary-foreground': primaryForeground,
    '--secondary': secondary,
    '--secondary-foreground': foreground,
    '--muted': muted,
    '--muted-foreground': mutedForeground,
    '--accent': base.accent,
    '--accent-foreground': accentForeground,
    '--border': border,
    '--input-background': secondary,
    '--switch-background': mixHex(secondary, foreground, 0.12),
    '--ring': base.primary,
    '--chart-1': base.primary,
    '--chart-2': base.accent,
    '--chart-3': chart3,
    '--chart-4': chart4,
    '--chart-5': chart5,
    '--sidebar': card,
    '--sidebar-foreground': cardForeground,
    '--sidebar-primary': base.primary,
    '--sidebar-primary-foreground': primaryForeground,
    '--sidebar-accent': secondary,
    '--sidebar-accent-foreground': foreground,
    '--sidebar-border': border,
    '--sidebar-ring': base.primary
  };
};

const getThemeTokens = (mode: Theme, preset: ColorPreset, custom: CustomTheme) => {
  if (preset === 'default') return null;
  if (preset === 'custom') {
    const background = adjustForTheme(custom.background, mode);
    const card = adjustForTheme(custom.card, mode);
    return buildThemeTokens({
      background,
      card,
      primary: custom.primary,
      accent: custom.accent
    });
  }
  const palette = presetPalettes[preset][mode];
  return buildThemeTokens(palette);
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('aura_theme_global');
      return stored === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [colorPreset, setColorPreset] = useState<ColorPreset>('default');
  const [customTheme, setCustomTheme] = useState(defaultCustomTheme);
  const [appearanceSaved, setAppearanceSaved] = useState({
    colorPreset: 'default' as ColorPreset,
    customTheme: defaultCustomTheme
  });
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [contrastMode, setContrastMode] = useState<ContrastMode>('normal');
  const [stateColors, setStateColors] = useState<StateColors>(defaultStateColors);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [cameraCount, setCameraCount] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const resetUserSettings = () => {
    setLanguage('ar');
    setTheme('dark');
    setColorPreset('default');
    setCustomTheme(defaultCustomTheme);
    setAppearanceSaved({ colorPreset: 'default', customTheme: defaultCustomTheme });
    setFontSize('medium');
    setContrastMode('normal');
    setIsSetupComplete(false);
    setSelectedProfile(null);
    setCameraCount(0);
    setHasSeenOnboarding(false);
  };

  useEffect(() => {
    if (!currentUserEmail) {
      resetUserSettings();
      return;
    }
    const key = `aura_user:${currentUserEmail}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      resetUserSettings();
      return;
    }
    try {
      const data = JSON.parse(stored);
      if (data.language) setLanguage(data.language);
      if (data.theme) setTheme(data.theme);
      const legacyThemeValue = normalizeCustomTheme(data.customTheme);
      const savedAppearance = data.appearanceSaved && data.appearanceSaved.colorPreset
        ? {
            colorPreset: data.appearanceSaved.colorPreset as ColorPreset,
            customTheme: isValidCustomTheme(data.appearanceSaved.customTheme)
              ? data.appearanceSaved.customTheme
              : legacyThemeValue
          }
        : {
            colorPreset: data.colorPreset ? data.colorPreset : 'default',
            customTheme: legacyThemeValue
          };
      setAppearanceSaved(savedAppearance);
      setColorPreset(savedAppearance.colorPreset);
      setCustomTheme(savedAppearance.customTheme);
      if (data.fontSize) setFontSize(data.fontSize);
      if (data.contrastMode) setContrastMode(data.contrastMode);
      if (typeof data.isSetupComplete === 'boolean') setIsSetupComplete(data.isSetupComplete);
      if (typeof data.hasSeenOnboarding === 'boolean') setHasSeenOnboarding(data.hasSeenOnboarding);
      if (typeof data.cameraCount === 'number') setCameraCount(data.cameraCount);
      if (typeof data.selectedProfile === 'string' || data.selectedProfile === null) {
        setSelectedProfile(data.selectedProfile);
      }
    } catch {
      resetUserSettings();
    }
  }, [currentUserEmail]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);
    
    // Set font family based on language
    if (language === 'ar') {
      root.style.fontFamily = "'Tajawal', 'IBM Plex Sans Arabic', sans-serif";
    } else {
      root.style.fontFamily = "'Inter', 'IBM Plex Sans', sans-serif";
    }
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('aura_theme_global', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (contrastMode === 'high') {
      root.classList.add('contrast-high');
    } else {
      root.classList.remove('contrast-high');
    }
  }, [contrastMode]);

  useEffect(() => {
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      extraLarge: '20px'
    };
    document.documentElement.style.setProperty('--font-size', fontSizes[fontSize]);
  }, [fontSize]);

  useEffect(() => {
    switch (colorPreset) {
      case 'gold':
        setStateColors(goldStateColors);
        break;
      case 'highContrast':
        setStateColors(highContrastColors);
        break;
      case 'default':
      default:
        setStateColors(defaultStateColors);
        break;
    }
  }, [colorPreset]);

  useEffect(() => {
    const root = document.documentElement;
    const tokens = getThemeTokens(theme, colorPreset, customTheme);
    if (!tokens) {
      THEME_VAR_KEYS.forEach((key) => root.style.removeProperty(key));
      return;
    }
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [colorPreset, customTheme, theme]);

  const saveAppearanceSettings = () => {
    setAppearanceSaved({ colorPreset, customTheme });
  };

  const restoreAppearanceDefaults = () => {
    setColorPreset('default');
    setCustomTheme(defaultCustomTheme);
    setAppearanceSaved({ colorPreset: 'default', customTheme: defaultCustomTheme });
  };

  useEffect(() => {
    if (!currentUserEmail) return;
    const payload = {
      language,
      theme,
      colorPreset: appearanceSaved.colorPreset,
      customTheme: appearanceSaved.customTheme,
      appearanceSaved,
      fontSize,
      contrastMode,
      isSetupComplete,
      hasSeenOnboarding,
      selectedProfile,
      cameraCount
    };
    localStorage.setItem(`aura_user:${currentUserEmail}`, JSON.stringify(payload));
  }, [
    currentUserEmail,
    language,
    theme,
    appearanceSaved,
    fontSize,
    contrastMode,
    isSetupComplete,
    hasSeenOnboarding,
    selectedProfile,
    cameraCount
  ]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        colorPreset,
        setColorPreset,
        customTheme,
        setCustomTheme,
        appearanceSaved,
        saveAppearanceSettings,
        restoreAppearanceDefaults,
        fontSize,
        setFontSize,
        contrastMode,
        setContrastMode,
        stateColors,
        setStateColors,
        isAuthenticated,
        setIsAuthenticated,
        isSetupComplete,
        setIsSetupComplete,
        selectedProfile,
        setSelectedProfile,
        cameraCount,
        setCameraCount,
        hasSeenOnboarding,
        setHasSeenOnboarding,
        currentUserEmail,
        setCurrentUserEmail
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
