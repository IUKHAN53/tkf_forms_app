import { create } from 'zustand';
import { Appearance } from 'react-native';

type Scheme = 'light' | 'dark';

type ThemeColors = {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
};

type ThemeState = {
  scheme: Scheme;
  toggle: () => void;
  setScheme: (scheme: Scheme) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  scheme: (Appearance.getColorScheme?.() as Scheme) || 'dark',
  toggle: () => set((state) => ({ scheme: state.scheme === 'dark' ? 'light' : 'dark' })),
  setScheme: (scheme) => set({ scheme }),
}));

const darkColors: ThemeColors = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const lightColors: ThemeColors = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
};

export const useThemeColors = () => {
  const scheme = useThemeStore((s) => s.scheme);
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return { scheme, colors };
};
