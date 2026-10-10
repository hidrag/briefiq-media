import Parser from 'rss-parser';
import { Category, NormalizedArticle } from '../../types/news.js';
import { NewsProvider } from './baseProvider.js';

interface CustomItem extends Parser.Item {
  'media:content'?: { $?: { url?: string } };
  'media:thumbnail'?: { $?: { url?: string } };
}

export class RSSProvider implements NewsProvider {
  name = 'RSSProvider';
  private parser: Parser<any, CustomItem>;

  // Curated RSS feeds per category
  private feeds: Record<Category, string[]> = {
    [Category.TECH]: [
      'https://feeds.feedburner.com/TechCrunch/',
      'https://www.theverge.com/rss/index.xml',
      'https://feeds.arstechnica.com/arstechnica/index'
    ],
    [Category.SCIENCE]: [
      'https://www.sciencedaily.com/rss/top/science.xml',
      'https://phys.org/rss-feed/'
    ],
    [Category.SPORTS]: [
      'https://www.espn.com/espn/rss/news',
      'https://api.foxsports.com/v1/rss?partnerKey=zBa1RvBcySp3atsA'
    ],
    [Category.ENTERTAINMENT]: [
      'https://variety.com/feed/',
      'https://www.hollywoodreporter.com/feed/'
    ],
    [Category.BUSINESS]: [
      'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
      'https://www.cnbc.com/id/10001147/device/rss/rss.html'
    ]
  };

  constructor() {
    this.parser = new Parser<any, CustomItem>({
      customFields: {
        item: [
          ['media:content', 'media:content'],
          ['media:thumbnail', 'media:thumbnail']
        ]
      }
    });
  }

  async fetchByCategory(category: Category): Promise<NormalizedArticle[]> {
    const urls = this.feeds[category] || [];
    const articles: NormalizedArticle[] = [];

    for (const url of urls) {
      try {
        const feed = await this.parser.parseURL(url);
        const sourceName = feed.title || 'RSS Feed';

        for (const item of feed.items) {
          if (!item.link || !item.title) continue;

          let imageUrl: string | undefined = undefined;
          if (item.enclosure?.url) {
            imageUrl = item.enclosure.url;
          } else if (item['media:content']?.$?.url) {
            imageUrl = item['media:content'].$.url;
          } else if (item['media:thumbnail']?.$?.url) {
            imageUrl = item['media:thumbnail'].$.url;
          }

          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

          articles.push({
            title: item.title.trim(),
            description: item.contentSnippet || item.content || item.summary || null,
            content: item.content || item.summary || null,
            sourceUrl: item.link.trim(),
            sourceName,
            imageUrl: imageUrl || null,
            publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
            category
          });
        }
      } catch (error) {
        console.error(`RSSProvider error fetching feed ${url} for category ${category}:`, error);
      }
    }

    return articles;
  }
}
