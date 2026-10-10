import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useArticles, useSummarizeArticle, useBookmarks, type Article } from '@/services/api';
import { Navbar } from '@/components/feed/Navbar';
import { ArticleGrid } from '@/components/feed/ArticleGrid';
import { AISummaryModal } from '@/components/modals/AISummaryModal';
import { ReaderMode } from '@/components/reader/ReaderMode';

const MainFeed: React.FC = () => {
  const { activeCategory, searchQuery, token } = usePreferencesStore();
  const [selectedArticleForSummary, setSelectedArticleForSummary] = useState<Article | null>(null);
  const [selectedArticleForReader, setSelectedArticleForReader] = useState<Article | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

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
    setSelectedArticleForSummary(article);
    setIsSummaryOpen(true);
    if (!article.summary) {
      summarizeMutate(article.id);
    }
  };

  const handleRead = (article: Article) => {
    setSelectedArticleForReader(article);
    setIsReaderOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ArticleGrid
          articles={filteredArticles}
          isLoading={isLoading}
          bookmarkedIds={bookmarkedIds}
          onSummarize={handleSummarize}
          onRead={handleRead}
        />
      </main>

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
