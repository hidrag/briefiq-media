export enum Category {
  TECH = 'TECH',
  SCIENCE = 'SCIENCE',
  SPORTS = 'SPORTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  BUSINESS = 'BUSINESS'
}

export interface NormalizedArticle {
  title: string;
  description?: string | null;
  content?: string | null;
  sourceUrl: string;
  sourceName: string;
  imageUrl?: string | null;
  publishedAt: Date;
  category: Category;
}
