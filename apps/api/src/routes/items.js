import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { validate } from '../middleware/validate.js';
import { 
  createItemSchema, 
  updateItemSchema, 
  updateStatusSchema,
  itemsQuerySchema,
  idParamSchema 
} from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const ITEMS_PER_PAGE = 20;

// GET /api/items
router.get('/', validate(itemsQuerySchema, 'query'), (req, res, next) => {
  try {
    const { page, q, status, tag, sort } = req.validatedQuery;
    const db = getDb();
    const offset = (page - 1) * ITEMS_PER_PAGE;

    let whereConditions = [];
    let params = [];

    // Search filter
    if (q) {
      whereConditions.push('(i.title LIKE ? OR i.url LIKE ? OR i.notes LIKE ?)');
      const searchPattern = `%${q}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (status) {
      whereConditions.push('i.status = ?');
      params.push(status);
    }

    // Tag filter
    if (tag) {
      whereConditions.push('EXISTS (SELECT 1 FROM item_tags it WHERE it.item_id = i.id AND it.tag_id = ?)');
      params.push(tag);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Sorting
    let orderClause = 'ORDER BY i.saved_at DESC';
    if (sort === 'statusFirst') {
      orderClause = 'ORDER BY CASE i.status WHEN \'UNREAD\' THEN 0 ELSE 1 END, i.saved_at DESC';
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM items i ${whereClause}`;
    const { total } = db.prepare(countQuery).get(...params);

    // Get items
    const itemsQuery = `
      SELECT i.id, i.title, i.url, i.status, i.notes, i.saved_at, i.read_at, i.created_at, i.updated_at
      FROM items i
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    const items = db.prepare(itemsQuery).all(...params, ITEMS_PER_PAGE, offset);

    // Get tags for each item
    const tagQuery = db.prepare(`
      SELECT t.id, t.name 
      FROM tags t 
      JOIN item_tags it ON t.id = it.tag_id 
      WHERE it.item_id = ?
    `);

    const itemsWithTags = items.map(item => ({
      ...item,
      tags: tagQuery.all(item.id)
    }));

    res.json({
      items: itemsWithTags,
      pagination: {
        page,
        perPage: ITEMS_PER_PAGE,
        total,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', validate(idParamSchema, 'params'), (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const db = getDb();

    const item = db.prepare(`
      SELECT id, title, url, status, notes, saved_at, read_at, created_at, updated_at
      FROM items WHERE id = ?
    `).get(id);

    if (!item) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    // Get tags
    const tags = db.prepare(`
      SELECT t.id, t.name 
      FROM tags t 
      JOIN item_tags it ON t.id = it.tag_id 
      WHERE it.item_id = ?
    `).all(id);

    res.json({ item: { ...item, tags } });
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', validate(createItemSchema), (req, res, next) => {
  try {
    const { title, url, status, notes, tagIds } = req.body;
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const readAt = status === 'READ' ? now : null;

    db.prepare(`
      INSERT INTO items (id, title, url, status, notes, saved_at, read_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, url, status, notes || null, now, readAt, now, now);

    // Add tags
    if (tagIds && tagIds.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)');
      for (const tagId of tagIds) {
        insertTag.run(id, tagId);
      }
    }

    // Fetch created item with tags
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    const tags = db.prepare(`
      SELECT t.id, t.name FROM tags t 
      JOIN item_tags it ON t.id = it.tag_id 
      WHERE it.item_id = ?
    `).all(id);

    res.status(201).json({ item: { ...item, tags } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/:id
router.put('/:id', validate(idParamSchema, 'params'), validate(updateItemSchema), (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { title, url, status, notes, tagIds } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    const now = new Date().toISOString();
    
    // Handle readAt based on status change
    let readAt = existing.read_at;
    if (status === 'READ' && existing.status === 'UNREAD') {
      readAt = now;
    } else if (status === 'UNREAD' && existing.status === 'READ') {
      readAt = null;
    }

    db.prepare(`
      UPDATE items 
      SET title = ?, url = ?, status = ?, notes = ?, read_at = ?, updated_at = ?
      WHERE id = ?
    `).run(title, url, status, notes || null, readAt, now, id);

    // Update tags - remove all and re-add
    db.prepare('DELETE FROM item_tags WHERE item_id = ?').run(id);
    if (tagIds && tagIds.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)');
      for (const tagId of tagIds) {
        insertTag.run(id, tagId);
      }
    }

    // Fetch updated item with tags
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    const tags = db.prepare(`
      SELECT t.id, t.name FROM tags t 
      JOIN item_tags it ON t.id = it.tag_id 
      WHERE it.item_id = ?
    `).all(id);

    res.json({ item: { ...item, tags } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete('/:id', validate(idParamSchema, 'params'), (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM items WHERE id = ?').get(id);
    if (!existing) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/items/:id/status
router.post('/:id/status', validate(idParamSchema, 'params'), validate(updateStatusSchema), (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { status } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    const now = new Date().toISOString();
    
    // Set or clear readAt based on new status
    let readAt = null;
    if (status === 'READ') {
      readAt = now;
    }

    db.prepare(`
      UPDATE items SET status = ?, read_at = ?, updated_at = ? WHERE id = ?
    `).run(status, readAt, now, id);

    // Fetch updated item with tags
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    const tags = db.prepare(`
      SELECT t.id, t.name FROM tags t 
      JOIN item_tags it ON t.id = it.tag_id 
      WHERE it.item_id = ?
    `).all(id);

    res.json({ item: { ...item, tags } });
  } catch (err) {
    next(err);
  }
});

export default router;

