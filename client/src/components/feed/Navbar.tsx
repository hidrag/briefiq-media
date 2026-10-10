import React from 'react';
import { Search, Bookmark, Newspaper } from 'lucide-react';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useBookmarks } from '@/services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'All News' },
  { id: 'TECH', label: 'Tech' },
  { id: 'SCIENCE', label: 'Science' },
  { id: 'SPORTS', label: 'Sports' },
  { id: 'ENTERTAINMENT', label: 'Entertainment' },
  { id: 'BUSINESS', label: 'Business' },
];

interface NavbarProps {
  onOpenBookmarks?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBookmarks }) => {
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery, token } = usePreferencesStore();
  const { data: bookmarkData } = useBookmarks(token || undefined);

  const bookmarkCount = bookmarkData?.bookmarks?.length || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveCategory('ALL')}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">NewsHub</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-semibold">AI</span>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search headlines & stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 rounded-full outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBookmarks}
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors cursor-pointer"
              title="Saved Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-900">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
