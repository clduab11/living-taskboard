import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

export const schemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string()
  }),

  createBoard: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    visibility: z.enum(['private', 'public', 'team']),
    settings: z.object({
      backgroundColor: z.string().optional(),
      gridEnabled: z.boolean().optional(),
      snapToGrid: z.boolean().optional(),
      gridSize: z.number().optional()
    }).optional()
  }),

  updateBoard: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    visibility: z.enum(['private', 'public', 'team']).optional(),
    settings: z.object({
      backgroundColor: z.string().optional(),
      gridEnabled: z.boolean().optional(),
      snapToGrid: z.boolean().optional(),
      gridSize: z.number().optional()
    }).optional()
  })
};
