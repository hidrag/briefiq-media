import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface Article {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  sourceUrl: string;
  sourceName: string;
  imageUrl?: string | null;
  category: string;
  publishedAt: string;
  summary?: {
    bullets?: string[];
    eli5?: string;
  } | null;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    totalArticles: number;
    totalPages: number;
  };
}

export interface FactCheckClaim {
  text?: string;
  claimant?: string;
  claimDate?: string;
  claimReview?: Array<{
    publisher?: { name?: string; site?: string };
    url?: string;
    title?: string;
    reviewRating?: { textualRating?: string };
  }>;
}

export interface FactCheckResponse {
  claims?: FactCheckClaim[];
}

export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
  article: Article;
}

// Fetch articles
export function useArticles(category?: string, page: number = 1, limit: number = 20) {
  return useQuery<ArticlesResponse>({
    queryKey: ['articles', category, page, limit],
    queryFn: async () => {
      const url = new URL(`${API_BASE_URL}/articles`);
      if (category && category !== 'ALL') {
        url.searchParams.append('category', category);
      }
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },
  });
}

// AI Summarize Article
export function useSummarizeArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (articleId: string) => {
      const res = await fetch(`${API_BASE_URL}/articles/${articleId}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to generate summary');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

// Google Fact Check Query
export function useFactCheck(query?: string) {
  return useQuery<FactCheckResponse>({
    queryKey: ['fact-check', query],
    queryFn: async () => {
      if (!query || query.trim().length < 3) return { claims: [] };
      const url = new URL(`${API_BASE_URL}/fact-check`);
      url.searchParams.append('query', query);

      const res = await fetch(url.toString());
      if (!res.ok) return { claims: [] };
      return res.json();
    },
    enabled: !!query && query.trim().length >= 3,
  });
}

// Fetch user bookmarks
export function useBookmarks(token?: string) {
  return useQuery<{ bookmarks: Bookmark[] }>({
    queryKey: ['bookmarks', token],
    queryFn: async () => {
      if (!token) return { bookmarks: [] };
      const res = await fetch(`${API_BASE_URL}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { bookmarks: [] };
      return res.json();
    },
    enabled: !!token,
  });
}

// Toggle Bookmark
export function useToggleBookmark(token?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ articleId, isBookmarked }: { articleId: string; isBookmarked: boolean }) => {
      if (!token) throw new Error('Authentication required');
      const method = isBookmarked ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/articles/${articleId}/bookmark`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to update bookmark');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
