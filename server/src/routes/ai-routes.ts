import { Router, Request, Response } from 'express';
import { 
  getAIsuggestions, 
  generateFromDescription, 
  recognizeAndFormat,
  searchCanvas 
} from '../services/ai-service';

const router = Router();

/**
 * POST /api/ai/suggestions
 * Get AI-powered suggestions for improving the canvas
 */
router.post('/suggestions', async (req: Request, res: Response) => {
  try {
    const { prompt, context, canvasObjects } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt is required' 
      });
    }

    const result = await getAIsuggestions({ prompt, context, canvasObjects });
    res.json(result);
  } catch (error: any) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/generate
 * Generate objects from natural language description
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description is required' 
      });
    }

    const result = await generateFromDescription(description);
    res.json(result);
  } catch (error: any) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/format
 * Smart object recognition and auto-formatting suggestions
 */
router.post('/format', async (req: Request, res: Response) => {
  try {
    const { canvasObjects } = req.body;

    if (!canvasObjects || !Array.isArray(canvasObjects)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Canvas objects array is required' 
      });
    }

    const result = await recognizeAndFormat(canvasObjects);
    res.json(result);
  } catch (error: any) {
    console.error('AI format error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/search
 * AI-powered search within canvas
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, canvasObjects } = req.body;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    if (!canvasObjects || !Array.isArray(canvasObjects)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Canvas objects array is required' 
      });
    }

    const result = await searchCanvas(query, canvasObjects);
    res.json(result);
  } catch (error: any) {
    console.error('AI search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

export default router;
