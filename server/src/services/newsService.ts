import { PrismaClient } from '@prisma/client';
import { Category, NormalizedArticle } from '../types/news.js';
import { NewsProvider } from './providers/baseProvider.js';
import { RSSProvider } from './providers/rssProvider.js';
import { GNewsProvider } from './providers/gnewsProvider.js';

const prisma = new PrismaClient();

export class NewsService {
  private providers: NewsProvider[];

  constructor() {
    this.providers = [
      new RSSProvider(),
      new GNewsProvider()
    ];
  }

  async syncNews(category?: Category): Promise<{ syncedCount: number; errorsCount: number }> {
    const categoriesToSync = category ? [category] : Object.values(Category);
    let syncedCount = 0;
    let errorsCount = 0;

    for (const cat of categoriesToSync) {
      const allArticles: NormalizedArticle[] = [];

      for (const provider of this.providers) {
        try {
          const articles = await provider.fetchByCategory(cat);
          allArticles.push(...articles);
        } catch (error) {
          console.error(`Error running provider ${provider.name} for category ${cat}:`, error);
          errorsCount++;
        }
      }

      // Deduplicate articles by sourceUrl in memory before database operations
      const articleMap = new Map<string, NormalizedArticle>();
      for (const article of allArticles) {
        if (!article.sourceUrl) continue;
        if (!articleMap.has(article.sourceUrl)) {
          articleMap.set(article.sourceUrl, article);
        }
      }

      // Upsert into database
      for (const article of articleMap.values()) {
        try {
          await prisma.article.upsert({
            where: { sourceUrl: article.sourceUrl },
            update: {
              title: article.title,
              description: article.description,
              content: article.content,
              sourceName: article.sourceName,
              imageUrl: article.imageUrl,
              publishedAt: article.publishedAt,
              category: article.category
            },
            create: {
              title: article.title,
              description: article.description,
              content: article.content,
              sourceUrl: article.sourceUrl,
              sourceName: article.sourceName,
              imageUrl: article.imageUrl,
              publishedAt: article.publishedAt,
              category: article.category
            }
          });
          syncedCount++;
        } catch (error) {
          console.error(`Error upserting article ${article.sourceUrl}:`, error);
          errorsCount++;
        }
      }
    }

    return { syncedCount, errorsCount };
  }
}

export const newsService = new NewsService();
