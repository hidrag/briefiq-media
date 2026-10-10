import React, { useState } from 'react';
import { Bookmark, Sparkles, BookOpen, ExternalLink, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Article } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const CATEGORY_FALLBACKS: Record<string, string> = {
  GENERAL: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=600&q=80',
  CRICKET: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
  TECH: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  SCIENCE: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
  SPORTS: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  ENTERTAINMENT: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  BUSINESS: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80',
};

interface ArticleCardProps {
  article: Article;
  isBookmarked?: boolean;
  onToggleBookmark?: (articleId: string) => void;
  onSummarize?: (article: Article) => void;
  onRead?: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isBookmarked = false,
  onToggleBookmark,
  onSummarize,
  onRead,
}) => {
  const categoryKey = article.category ? article.category.toUpperCase() : 'DEFAULT';
  const defaultFallback = CATEGORY_FALLBACKS[categoryKey] || CATEGORY_FALLBACKS.DEFAULT;

  const [imgSrc, setImgSrc] = useState<string>(article.imageUrl || defaultFallback);

  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Recently';

  const isReddit = article.sourceName.toLowerCase().includes('reddit') || article.sourceName.toLowerCase().startsWith('r/');

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imgSrc}
          alt={article.title}
          loading="lazy"
          onError={() => {
            if (imgSrc !== defaultFallback) {
              setImgSrc(defaultFallback);
            }
          }}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
          <Badge
            variant="default"
            className={
              categoryKey === 'CRICKET'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950/80 backdrop-blur-md text-white border border-white/10'
            }
          >
            {article.category}
          </Badge>
          <Badge
            variant="secondary"
            className={
              isReddit
                ? 'bg-orange-600 text-white font-bold backdrop-blur-md'
                : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200'
            }
          >
            {article.sourceName}
          </Badge>
        </div>

        <button
          onClick={() => onToggleBookmark?.(article.id)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
          title={isBookmarked ? 'Remove Bookmark' : 'Save Article'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400">{timeAgo}</span>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {article.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSummarize?.(article)}
            className="flex-1 text-xs gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            AI Summary
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onRead?.(article)}
            className="flex-1 text-xs gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read
          </Button>

          {isReddit ? (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="View Reddit Thread"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          ) : (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Open original link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
