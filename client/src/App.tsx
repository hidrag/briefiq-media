import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useArticles, useSummarizeArticle, useBookmarks, type Article } from '@/services/api';
import { Navbar } from '@/components/feed/Navbar';
import { ArticleGrid } from '@/components/feed/ArticleGrid';
import { AISummaryModal } from '@/components/modals/AISummaryModal';
import { ReaderMode } from '@/components/reader/ReaderMode';
import { History, X } from 'lucide-react';

const RECENTLY_VIEWED_KEY = 'news_hub_recently_viewed';

const loadRecentlyViewed = (): Article[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading recently viewed articles:', e);
    return [];
  }
};

const MainFeed: React.FC = () => {
  const { activeCategory, searchQuery, token } = usePreferencesStore();
  const [selectedArticleForSummary, setSelectedArticleForSummary] = useState<Article | null>(null);
  const [selectedArticleForReader, setSelectedArticleForReader] = useState<Article | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isRecentlyViewedOpen, setIsRecentlyViewedOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Article[]>(loadRecentlyViewed);

  const addToRecentlyViewed = (article: Article) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((a) => a.id !== article.id);
      const updated = [article, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recently viewed article:', e);
      }
      return updated;
    });
  };

  const { data: articleData, isLoading } = useArticles(activeCategory);
  const { mutate: summarizeMutate, isPending: isSummarizing } = useSummarizeArticle();
  const { data: bookmarkData } = useBookmarks(token || undefined);

  const bookmarkedIds = new Set(bookmarkData?.bookmarks?.map((b) => b.articleId) || []);

  const filteredArticles = (articleData?.articles || []).filter((art) => {
    if (!searchQuery) return true;
    return (
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSummarize = (article: Article) => {
    addToRecentlyViewed(article);
    setSelectedArticleForSummary(article);
    setIsSummaryOpen(true);
    if (!article.summary) {
      summarizeMutate(article.id);
    }
  };

  const handleRead = (article: Article) => {
    addToRecentlyViewed(article);
    setSelectedArticleForReader(article);
    setIsReaderOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Navbar onOpenRecentlyViewed={() => setIsRecentlyViewedOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ArticleGrid
          articles={filteredArticles}
          isLoading={isLoading}
          bookmarkedIds={bookmarkedIds}
          onSummarize={handleSummarize}
          onRead={handleRead}
        />
      </main>

      {/* Recently Viewed Drawer */}
      {isRecentlyViewedOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-base">Recently Viewed</h2>
                </div>
                <button
                  onClick={() => setIsRecentlyViewedOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 overflow-y-auto max-h-[75vh]">
                {recentlyViewed.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No recently viewed stories yet.</p>
                ) : (
                  recentlyViewed.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        setIsRecentlyViewedOpen(false);
                        handleRead(art);
                      }}
                      className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors space-y-1"
                    >
                      <span className="text-[10px] font-bold text-blue-600 uppercase">{art.sourceName}</span>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-2">
                        {art.title}
                      </h4>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AISummaryModal
        article={selectedArticleForSummary}
        isOpen={isSummaryOpen}
        isLoading={isSummarizing}
        summary={selectedArticleForSummary?.summary}
        onClose={() => setIsSummaryOpen(false)}
      />

      <ReaderMode
        article={selectedArticleForReader}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainFeed />
    </QueryClientProvider>
  );
}
