import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Item schemas
export const createItemSchema = z.object({
  title: z.string()
    .transform(s => s.trim())
    .pipe(z.string().min(1, 'Title is required').max(180, 'Title must be 180 characters or less')),
  url: z.string().url('Invalid URL format'),
  status: z.enum(['UNREAD', 'READ']).default('UNREAD'),
  notes: z.string().max(5000, 'Notes must be 5000 characters or less').nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional().default([])
});

export const updateItemSchema = z.object({
  title: z.string()
    .transform(s => s.trim())
    .pipe(z.string().min(1, 'Title is required').max(180, 'Title must be 180 characters or less')),
  url: z.string().url('Invalid URL format'),
  status: z.enum(['UNREAD', 'READ']),
  notes: z.string().max(5000, 'Notes must be 5000 characters or less').nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional().default([])
});

export const updateStatusSchema = z.object({
  status: z.enum(['UNREAD', 'READ'])
});

export const itemsQuerySchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v, 10) : 1).pipe(z.number().int().min(1)),
  q: z.string().max(200).optional().default(''),
  status: z.enum(['', 'UNREAD', 'READ']).optional().default(''),
  tag: z.string().uuid().optional().default(''),
  sort: z.enum(['savedAt', 'statusFirst']).optional().default('savedAt')
});

// Tag schemas
export const createTagSchema = z.object({
  name: z.string()
    .transform(s => s.trim().toLowerCase())
    .pipe(z.string().min(1, 'Tag name is required').max(50, 'Tag name must be 50 characters or less'))
});

export const updateTagSchema = z.object({
  name: z.string()
    .transform(s => s.trim().toLowerCase())
    .pipe(z.string().min(1, 'Tag name is required').max(50, 'Tag name must be 50 characters or less'))
});

// Param schemas
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

