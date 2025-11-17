import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client (will be undefined if no API key)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface AIAssistRequest {
  prompt: string;
  context?: string;
  canvasObjects?: any[];
}

interface AIAssistResponse {
  success: boolean;
  message: string;
  suggestions?: any[];
  error?: string;
}

/**
 * Get AI-powered suggestions for canvas improvements
 */
export async function getAIsuggestions(request: AIAssistRequest): Promise<AIAssistResponse> {
  if (!openai) {
    return {
      success: false,
      message: 'AI service not configured. Please add OPENAI_API_KEY to environment.',
      error: 'NO_API_KEY',
    };
  }

  try {
    const systemPrompt = `You are an AI assistant for a collaborative whiteboard application. 
Your role is to help users improve their diagrams, flowcharts, mind maps, and visual content.
You can suggest:
- Better organization and layout
- Missing elements or connections
- Color schemes and styling
- Content improvements
- Structural enhancements

Provide actionable, specific suggestions in a friendly tone.`;

    const userPrompt = `${request.prompt}

${request.context ? `Context: ${request.context}` : ''}

${request.canvasObjects && request.canvasObjects.length > 0 
  ? `Current canvas has ${request.canvasObjects.length} objects.` 
  : 'Canvas is currently empty.'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'No suggestions available.';

    return {
      success: true,
      message: response,
    };
  } catch (error: any) {
    console.error('AI service error:', error);
    return {
      success: false,
      message: 'Failed to generate AI suggestions.',
      error: error.message,
    };
  }
}

/**
 * Generate object descriptions from natural language
 */
export async function generateFromDescription(description: string): Promise<AIAssistResponse> {
  if (!openai) {
    return {
      success: false,
      message: 'AI service not configured.',
      error: 'NO_API_KEY',
    };
  }

  try {
    const systemPrompt = `You are an AI assistant that converts natural language descriptions into whiteboard objects.
When given a description, generate a JSON array of objects with these properties:
- type: 'rect', 'circle', 'text', or 'sticky'
- x, y: position coordinates
- width, height: dimensions (if applicable)
- text: text content (for text/sticky objects)
- fill: color (hex format)
- stroke: border color (hex format)

Generate objects that make sense for the description. Be creative but logical.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate whiteboard objects for: ${description}` },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '[]';

    try {
      // Try to parse as JSON
      const suggestions = JSON.parse(response);
      return {
        success: true,
        message: 'Objects generated successfully.',
        suggestions,
      };
    } catch {
      // If not valid JSON, return as text
      return {
        success: true,
        message: response,
      };
    }
  } catch (error: any) {
    console.error('AI generation error:', error);
    return {
      success: false,
      message: 'Failed to generate objects.',
      error: error.message,
    };
  }
}

/**
 * Smart object recognition and auto-formatting
 */
export async function recognizeAndFormat(canvasObjects: any[]): Promise<AIAssistResponse> {
  if (!openai) {
    return {
      success: false,
      message: 'AI service not configured.',
      error: 'NO_API_KEY',
    };
  }

  try {
    const systemPrompt = `You are an AI assistant that analyzes whiteboard content and suggests formatting improvements.
Analyze the objects and suggest:
- Alignment improvements
- Spacing adjustments
- Color coordination
- Grouping related items
- Adding connectors between related objects

Return suggestions as actionable steps.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Analyze these ${canvasObjects.length} whiteboard objects and suggest formatting improvements:\n${JSON.stringify(canvasObjects, null, 2)}` 
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'No suggestions available.';

    return {
      success: true,
      message: response,
    };
  } catch (error: any) {
    console.error('AI recognition error:', error);
    return {
      success: false,
      message: 'Failed to analyze objects.',
      error: error.message,
    };
  }
}

/**
 * AI-powered search within canvas
 */
export async function searchCanvas(query: string, canvasObjects: any[]): Promise<AIAssistResponse> {
  if (!openai) {
    return {
      success: false,
      message: 'AI service not configured.',
      error: 'NO_API_KEY',
    };
  }

  try {
    const systemPrompt = `You are an AI assistant that helps users find objects on their whiteboard.
Given a search query and canvas objects, identify relevant objects and explain why they match.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Search query: "${query}"\nCanvas objects:\n${JSON.stringify(canvasObjects, null, 2)}` 
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || 'No results found.';

    return {
      success: true,
      message: response,
    };
  } catch (error: any) {
    console.error('AI search error:', error);
    return {
      success: false,
      message: 'Search failed.',
      error: error.message,
    };
  }
}
