import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { validate } from '../middleware/validate.js';
import { createTagSchema, updateTagSchema, idParamSchema } from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/tags
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const tags = db.prepare(`
      SELECT t.id, t.name, t.created_at,
             (SELECT COUNT(*) FROM item_tags it WHERE it.tag_id = t.id) as item_count
      FROM tags t
      ORDER BY t.name ASC
    `).all();

    res.json({ tags });
  } catch (err) {
    next(err);
  }
});

// POST /api/tags
router.post('/', validate(createTagSchema), (req, res, next) => {
  try {
    const { name } = req.body;
    const db = getDb();

    // Check for duplicate
    const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(name);
    if (existing) {
      throw new AppError('Tag already exists', 400, 'DUPLICATE_TAG');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tags (id, name, created_at)
      VALUES (?, ?, ?)
    `).run(id, name, now);

    const tag = db.prepare('SELECT id, name, created_at FROM tags WHERE id = ?').get(id);

    res.status(201).json({ tag: { ...tag, item_count: 0 } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tags/:id
router.put('/:id', validate(idParamSchema, 'params'), validate(updateTagSchema), (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { name } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM tags WHERE id = ?').get(id);
    if (!existing) {
      throw new AppError('Tag not found', 404, 'NOT_FOUND');
    }

    // Check for duplicate name (excluding current tag)
    const duplicate = db.prepare('SELECT id FROM tags WHERE name = ? AND id != ?').get(name, id);
    if (duplicate) {
      throw new AppError('Tag name already exists', 400, 'DUPLICATE_TAG');
    }

    db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(name, id);

    const tag = db.prepare(`
      SELECT t.id, t.name, t.created_at,
             (SELECT COUNT(*) FROM item_tags it WHERE it.tag_id = t.id) as item_count
      FROM tags t WHERE t.id = ?
    `).get(id);

    res.json({ tag });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tags/:id
router.delete('/:id', validate(idParamSchema, 'params'), (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM tags WHERE id = ?').get(id);
    if (!existing) {
      throw new AppError('Tag not found', 404, 'NOT_FOUND');
    }

    // CASCADE will handle item_tags deletion
    db.prepare('DELETE FROM tags WHERE id = ?').run(id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

