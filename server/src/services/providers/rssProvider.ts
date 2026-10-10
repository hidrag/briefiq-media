import Parser from 'rss-parser';
import { Category, NormalizedArticle } from '../../types/news.js';
import { NewsProvider } from './baseProvider.js';
import { CATEGORY_FEEDS } from '../../config/feeds.js';

interface CustomItem extends Parser.Item {
  'media:content'?: { $?: { url?: string } };
  'media:thumbnail'?: { $?: { url?: string } };
  'content:encoded'?: string;
}

export class RSSProvider implements NewsProvider {
  name = 'RSSProvider';
  private parser: Parser<any, CustomItem>;

  constructor() {
    this.parser = new Parser<any, CustomItem>({
      customFields: {
        item: [
          ['media:content', 'media:content'],
          ['media:thumbnail', 'media:thumbnail'],
          ['content:encoded', 'content:encoded'],
        ],
      },
    });
  }

  private extractImageUrl(item: CustomItem): string | null {
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }
    if (item['media:content']?.$?.url) {
      return item['media:content'].$.url;
    }
    if (item['media:thumbnail']?.$?.url) {
      return item['media:thumbnail'].$.url;
    }

    const htmlContent = item.content || item.summary || item['content:encoded'] || '';
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = htmlContent.match(imgRegex);
    if (match && match[1]) {
      return match[1];
    }

    return null;
  }

  async fetchByCategory(category: Category): Promise<NormalizedArticle[]> {
    const urls = CATEGORY_FEEDS[category] || [];
    const articles: NormalizedArticle[] = [];

    for (const url of urls) {
      try {
        const feed = await this.parser.parseURL(url);
        const sourceName = feed.title || 'RSS Feed';

        for (const item of feed.items) {
          if (!item.link || !item.title) continue;

          const imageUrl = this.extractImageUrl(item);
          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

          articles.push({
            title: item.title.trim(),
            description: item.contentSnippet || item.content || item.summary || null,
            content: item.content || item.summary || null,
            sourceUrl: item.link.trim(),
            sourceName,
            imageUrl: imageUrl || null,
            publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
            category,
          });
        }
      } catch (error) {
        console.error(`RSSProvider error fetching feed ${url} for category ${category}:`, error);
      }
    }

    return articles;
  }
}
