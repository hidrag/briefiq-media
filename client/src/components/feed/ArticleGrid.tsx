import React from 'react';
import type { Article } from '@/services/api';
import { ArticleCard } from './ArticleCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface ArticleGridProps {
  articles: Article[];
  isLoading: boolean;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (articleId: string) => void;
  onSummarize?: (article: Article) => void;
  onRead?: (article: Article) => void;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  isLoading,
  bookmarkedIds = new Set(),
  onToggleBookmark,
  onSummarize,
  onRead,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
          No news articles found for this topic.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isBookmarked={bookmarkedIds.has(article.id)}
          onToggleBookmark={onToggleBookmark}
          onSummarize={onSummarize}
          onRead={onRead}
        />
      ))}
    </div>
  );
};
