import express from 'express';
import { getDb } from '../db/connection.js';

const router = express.Router();

// GET /api/metrics/summary
router.get('/summary', (req, res, next) => {
  try {
    const db = getDb();

    // Get unread count
    const { unreadCount } = db.prepare(`
      SELECT COUNT(*) as unreadCount FROM items WHERE status = 'UNREAD'
    `).get();

    // Get total count
    const { totalCount } = db.prepare(`
      SELECT COUNT(*) as totalCount FROM items
    `).get();

    // Get read this month count
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { readThisMonthCount } = db.prepare(`
      SELECT COUNT(*) as readThisMonthCount 
      FROM items 
      WHERE status = 'READ' AND read_at >= ?
    `).get(startOfMonth);

    res.json({
      unreadCount,
      readThisMonthCount,
      totalCount
    });
  } catch (err) {
    next(err);
  }
});

export default router;

