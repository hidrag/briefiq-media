import { Category, NormalizedArticle } from '../../types/news.js';
import { NewsProvider } from './baseProvider.js';

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export class GNewsProvider implements NewsProvider {
  name = 'GNewsProvider';

  private categoryMap: Record<Category, string> = {
    [Category.GENERAL]: 'general',
    [Category.TECH]: 'technology',
    [Category.SCIENCE]: 'science',
    [Category.SPORTS]: 'sports',
    [Category.CRICKET]: 'sports',
    [Category.ENTERTAINMENT]: 'entertainment',
    [Category.BUSINESS]: 'business'
  };

  async fetchByCategory(category: Category): Promise<NormalizedArticle[]> {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey || apiKey === 'your-gnews-api-key') {
      return [];
    }

    const gnewsCategory = this.categoryMap[category];
    const query = category === Category.CRICKET ? '&q=cricket' : '';
    const url = `https://gnews.io/api/v4/top-headlines?category=${gnewsCategory}${query}&lang=en&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`GNews API returned status ${response.status} ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as GNewsResponse;
      if (!data.articles) return [];

      return data.articles.map((item) => {
        const publishedAt = item.publishedAt ? new Date(item.publishedAt) : new Date();

        return {
          title: item.title,
          description: item.description || null,
          content: item.content || null,
          sourceUrl: item.url,
          sourceName: item.source?.name || 'GNews',
          imageUrl: item.image || null,
          publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
          category
        };
      });
    } catch (error) {
      console.error(`GNewsProvider error fetching category ${category}:`, error);
      return [];
    }
  }
}
