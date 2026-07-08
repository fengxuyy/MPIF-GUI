import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Helper to apply theme to document element
const applyThemeToDOM = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
};

// Initialize from localStorage or default to 'light' per user request
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mpif-gui:theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      applyThemeToDOM(saved);
      return saved;
    }
  }
  applyThemeToDOM('light');
  return 'light';
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem('mpif-gui:theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('mpif-gui:theme', next);
      applyThemeToDOM(next);
      return { theme: next };
    });
  },
}));
