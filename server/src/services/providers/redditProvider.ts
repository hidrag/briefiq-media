import { Category, NormalizedArticle } from '../../types/news.js';
import { NewsProvider } from './baseProvider.js';

interface RedditPostData {
  title: string;
  selftext?: string;
  url: string;
  permalink: string;
  stickied?: boolean;
  thumbnail?: string;
  preview?: {
    images?: Array<{
      source?: {
        url?: string;
      };
    }>;
  };
  created_utc: number;
  subreddit: string;
}

interface RedditChild {
  data: RedditPostData;
}

interface RedditResponse {
  data?: {
    children?: RedditChild[];
  };
}

export class RedditProvider implements NewsProvider {
  name = 'RedditProvider';

  private subredditMap: Partial<Record<Category, string>> = {
    [Category.CRICKET]: 'https://www.reddit.com/r/Cricket/hot.json?limit=20',
    [Category.ENTERTAINMENT]: 'https://www.reddit.com/r/bollywood/hot.json?limit=20',
    [Category.TECH]: 'https://www.reddit.com/r/technology/hot.json?limit=20',
    [Category.GENERAL]: 'https://www.reddit.com/r/india/hot.json?limit=20',
  };

  async fetchByCategory(category: Category): Promise<NormalizedArticle[]> {
    const url = this.subredditMap[category];
    if (!url) return [];

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BriefIQ/1.0 (by /u/briefiq_app)',
        },
      });

      if (!response.ok) {
        console.error(`Reddit API returned status ${response.status} for ${category}`);
        return [];
      }

      const json = (await response.json()) as RedditResponse;
      const children = json.data?.children || [];
      const articles: NormalizedArticle[] = [];

      for (const child of children) {
        const post = child.data;
        if (!post || post.stickied) continue;

        let imageUrl: string | null = null;

        if (post.preview?.images?.[0]?.source?.url) {
          imageUrl = post.preview.images[0].source.url.replace(/&amp;/g, '&');
        } else if (
          post.thumbnail &&
          post.thumbnail.startsWith('http') &&
          !post.thumbnail.includes('self') &&
          !post.thumbnail.includes('default')
        ) {
          imageUrl = post.thumbnail;
        }

        const publishedAt = new Date(post.created_utc * 1000);

        articles.push({
          title: post.title,
          description: post.selftext ? post.selftext.slice(0, 300) : post.title,
          content: post.selftext || null,
          sourceUrl: `https://www.reddit.com${post.permalink}`,
          sourceName: `r/${post.subreddit}`,
          imageUrl,
          publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
          category,
        });
      }

      return articles;
    } catch (error) {
      console.error(`RedditProvider error fetching category ${category}:`, error);
      return [];
    }
  }
}
