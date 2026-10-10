import { GoogleGenAI } from '@google/genai';

export interface SummaryResult {
  bullets: string[];
  eli5: string;
}

export class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('GEMINI_API_KEY is not set or using default value.');
    }
  }

  async generateSummary(textToSummarize: string): Promise<SummaryResult> {
    if (!this.ai) {
      // Fallback mock response when Gemini API key is missing
      return {
        bullets: [
          'Key point 1 summarizing the main event described in the article.',
          'Key point 2 focusing on implications and expert commentary.',
          'Key point 3 providing context and future prospects.'
        ],
        eli5: 'This article explains an important update in simple terms so anyone can understand what happened.'
      };
    }

    const prompt = `
You are an expert news editor. Read the following article content or headline/description carefully and provide a summary in valid JSON format.

JSON format requirement:
{
  "bullets": [
    "First concise key takeaway bullet point",
    "Second concise key takeaway bullet point",
    "Third concise key takeaway bullet point"
  ],
  "eli5": "Explain this news story in simple terms suitable for a 5-year-old or general audience."
}

Article Content:
${textToSummarize}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(responseText) as SummaryResult;
      return {
        bullets: parsed.bullets || [],
        eli5: parsed.eli5 || ''
      };
    } catch (error) {
      console.error('Error generating summary with Gemini API:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
