import { Category } from '../types/news.js';

export const CATEGORY_FEEDS: Record<Category, string[]> = {
  [Category.TECH]: [
    'https://feeds.feedburner.com/TechCrunch/',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/index',
  ],
  [Category.SCIENCE]: [
    'https://www.sciencedaily.com/rss/top/science.xml',
    'https://phys.org/rss-feed/',
  ],
  [Category.SPORTS]: [
    'https://www.espn.com/espn/rss/news',
    'https://api.foxsports.com/v1/rss?partnerKey=zBa1RvBcySp3atsA',
    'https://www.cricinfo.com/rss/content/story/feeds/0.xml',
    'https://feeds.feedburner.com/ndtvsports-cricket',
  ],
  [Category.ENTERTAINMENT]: [
    'https://variety.com/feed/',
    'https://www.hollywoodreporter.com/feed/',
  ],
  [Category.BUSINESS]: [
    'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    'https://www.cnbc.com/id/10001147/device/rss/rss.html',
  ],
};
