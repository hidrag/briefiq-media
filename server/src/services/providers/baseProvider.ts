import { Category, NormalizedArticle } from '../../types/news.js';

export interface NewsProvider {
  name: string;
  fetchByCategory(category: Category): Promise<NormalizedArticle[]>;
}
