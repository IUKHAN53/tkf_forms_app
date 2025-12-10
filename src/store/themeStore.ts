import { create } from 'zustand';
import { Appearance } from 'react-native';

type Scheme = 'light' | 'dark';

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

export const useThemeColors = () => {
  const scheme = useThemeStore((s) => s.scheme);
  const colors =
    scheme === 'dark'
      ? { bg: '#0f172a', card: '#0b1220', border: '#1e293b', text: '#e2e8f0', muted: '#94a3b8', primary: '#1d4ed8' }
      : { bg: '#f5f5f5', card: '#ffffff', border: '#e5e7eb', text: '#0f172a', muted: '#475569', primary: '#1d4ed8' };

  return { scheme, colors };
};
