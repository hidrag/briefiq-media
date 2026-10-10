import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const query = req.query.query as string;
  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  const apiKey = process.env.FACT_CHECK_API_KEY;
  if (!apiKey || apiKey === 'your-google-fact-check-api-key') {
    res.status(500).json({ error: 'Google Fact Check API key is not configured' });
    return;
  }

  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      res.status(response.status).json({ error: `Fact Check API error: ${response.statusText}` });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error querying Fact Check API:', error);
    res.status(500).json({ error: 'Internal server error while fetching fact check data' });
  }
});

export default router;
