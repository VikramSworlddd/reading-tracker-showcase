import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || './data/dev.db';
const resolvedPath = path.resolve(__dirname, '../../', dbPath);

// Create data directory if it doesn't exist
const dataDir = path.dirname(resolvedPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created directory: ${dataDir}`);
}

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run migrations as separate statements
const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  
  // Tags table
  `CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  )`,
  
  // Items table
  `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('UNREAD', 'READ')),
    notes TEXT,
    saved_at TEXT NOT NULL,
    read_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  
  // Item-Tags junction table
  `CREATE TABLE IF NOT EXISTS item_tags (
    item_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`,
  
  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)`,
  `CREATE INDEX IF NOT EXISTS idx_items_saved_at ON items(saved_at)`,
  `CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at)`,
  `CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id)`,
  `CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id)`
];

// Execute each migration
for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch (err) {
    console.error(`Error executing migration:`);
    console.error(sql);
    console.error(err.message);
    process.exit(1);
  }
}

console.log('Database migration completed successfully.');
console.log(`Database path: ${resolvedPath}`);

db.close();
