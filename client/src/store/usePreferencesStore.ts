import { create } from 'zustand';

export type ReaderTheme = 'light' | 'sepia' | 'dark';

interface PreferencesState {
  activeCategory: string;
  searchQuery: string;
  fontSize: number; // e.g. 16, 18, 20, 22
  readerTheme: ReaderTheme;
  token: string | null;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setFontSize: (size: number) => void;
  setReaderTheme: (theme: ReaderTheme) => void;
  setToken: (token: string | null) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  activeCategory: 'ALL',
  searchQuery: '',
  fontSize: 18,
  readerTheme: 'light',
  token: localStorage.getItem('token'),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFontSize: (fontSize) => set({ fontSize }),
  setReaderTheme: (readerTheme) => set({ readerTheme }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
}));
