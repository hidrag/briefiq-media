import Parser from 'rss-parser';
import { Category, NormalizedArticle } from '../../types/news.js';
import { NewsProvider } from './baseProvider.js';

interface CustomItem extends Parser.Item {
  'media:content'?: { $?: { url?: string } };
  'media:thumbnail'?: { $?: { url?: string } };
  'content:encoded'?: string;
}

export class RedditProvider implements NewsProvider {
  name = 'RedditProvider';
  private parser: Parser<any, CustomItem>;

  private subredditFeeds: Record<Category, string[]> = {
    [Category.TECH]: [
      'https://www.reddit.com/r/technology/.rss',
      'https://www.reddit.com/r/artificial/.rss',
      'https://www.reddit.com/r/MachineLearning/.rss',
    ],
    [Category.INDIA]: [
      'https://www.reddit.com/r/india/.rss',
      'https://www.reddit.com/r/IndiaSpeaks/.rss',
    ],
    [Category.KOLKATA]: [
      'https://www.reddit.com/r/kolkata/.rss',
      'https://www.reddit.com/r/calcutta/.rss',
    ],
    [Category.CRICKET]: [
      'https://www.reddit.com/r/Cricket/.rss',
    ],
    [Category.ENTERTAINMENT]: [
      'https://www.reddit.com/r/bollywood/.rss',
    ],
    [Category.GENERAL]: [
      'https://www.reddit.com/r/india/.rss',
    ],
    [Category.SCIENCE]: [
      'https://www.reddit.com/r/science/.rss',
    ],
    [Category.SPORTS]: [
      'https://www.reddit.com/r/sports/.rss',
    ],
    [Category.BUSINESS]: [
      'https://www.reddit.com/r/business/.rss',
    ],
  };

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
      return match[1].replace(/&amp;/g, '&');
    }

    return null;
  }

  private extractSubredditName(url: string): string {
    const match = url.match(/\/r\/([^/]+)/);
    return match ? `r/${match[1]}` : 'Reddit';
  }

  async fetchByCategory(category: Category): Promise<NormalizedArticle[]> {
    const urls = this.subredditFeeds[category] || [];
    const articles: NormalizedArticle[] = [];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (!response.ok) {
          console.warn(`Reddit RSS returned status ${response.status} for feed ${url}`);
          continue;
        }

        const xmlText = await response.text();
        const feed = await this.parser.parseString(xmlText);
        const sourceName = this.extractSubredditName(url);

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
            imageUrl,
            publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
            category,
          });
        }
      } catch (error) {
        console.error(`RedditProvider error fetching feed ${url} for category ${category}:`, error);
      }
    }

    return articles;
  }
}
