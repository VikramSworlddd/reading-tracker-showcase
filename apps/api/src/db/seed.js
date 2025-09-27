import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { getDb, closeDb } from './connection.js';

dotenv.config();

const db = getDb();

// Seed admin user
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existingUser) {
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(`
    INSERT INTO users (id, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), adminEmail, passwordHash, new Date().toISOString());
  console.log(`Created admin user: ${adminEmail}`);
} else {
  console.log(`Admin user already exists: ${adminEmail}`);
}

// Seed tags
const tagNames = [
  'javascript', 'typescript', 'react', 'nodejs', 'python',
  'devops', 'database', 'security', 'testing', 'architecture',
  'css', 'performance'
];

const insertTag = db.prepare(`
  INSERT OR IGNORE INTO tags (id, name, created_at)
  VALUES (?, ?, ?)
`);

for (const name of tagNames) {
  insertTag.run(uuidv4(), name.toLowerCase(), new Date().toISOString());
}
console.log(`Seeded ${tagNames.length} tags`);

// Get all tag IDs for item tagging
const allTags = db.prepare('SELECT id, name FROM tags').all();
const tagMap = new Map(allTags.map(t => [t.name, t.id]));

// Seed reading items
const sampleItems = [
  { title: 'Understanding React Server Components', url: 'https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023', tags: ['react', 'javascript'] },
  { title: 'A Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', tags: ['css'] },
  { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', tags: ['nodejs', 'javascript'] },
  { title: 'The TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', tags: ['typescript'] },
  { title: 'SQL Performance Explained', url: 'https://use-the-index-luke.com/', tags: ['database', 'performance'] },
  { title: 'OWASP Top 10 Security Risks', url: 'https://owasp.org/www-project-top-ten/', tags: ['security'] },
  { title: 'Testing JavaScript Applications', url: 'https://testingjavascript.com/', tags: ['testing', 'javascript'] },
  { title: 'Clean Architecture for Frontend', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html', tags: ['architecture'] },
  { title: 'Introduction to Docker', url: 'https://docs.docker.com/get-started/', tags: ['devops'] },
  { title: 'Python Type Hints Explained', url: 'https://realpython.com/python-type-hints/', tags: ['python'] },
  { title: 'React Hooks Deep Dive', url: 'https://react.dev/reference/react', tags: ['react', 'javascript'] },
  { title: 'CSS Grid Complete Guide', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', tags: ['css'] },
  { title: 'Express.js Security Best Practices', url: 'https://expressjs.com/en/advanced/best-practice-security.html', tags: ['nodejs', 'security'] },
  { title: 'TypeScript Generics Tutorial', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', tags: ['typescript'] },
  { title: 'PostgreSQL Performance Tuning', url: 'https://wiki.postgresql.org/wiki/Performance_Optimization', tags: ['database', 'performance'] },
  { title: 'JWT Authentication Best Practices', url: 'https://auth0.com/blog/jwt-authentication-best-practices/', tags: ['security', 'nodejs'] },
  { title: 'Jest Testing Framework Guide', url: 'https://jestjs.io/docs/getting-started', tags: ['testing', 'javascript'] },
  { title: 'Domain-Driven Design Basics', url: 'https://martinfowler.com/bliki/DomainDrivenDesign.html', tags: ['architecture'] },
  { title: 'Kubernetes for Developers', url: 'https://kubernetes.io/docs/tutorials/', tags: ['devops'] },
  { title: 'Python Async/Await Tutorial', url: 'https://realpython.com/async-io-python/', tags: ['python'] },
  { title: 'React Performance Optimization', url: 'https://react.dev/learn/render-and-commit', tags: ['react', 'performance'] },
  { title: 'Modern CSS Features', url: 'https://web.dev/articles/css-nesting', tags: ['css'] },
  { title: 'Node.js Streams Explained', url: 'https://nodejs.org/api/stream.html', tags: ['nodejs'] },
  { title: 'TypeScript Utility Types', url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html', tags: ['typescript'] },
  { title: 'Database Indexing Strategies', url: 'https://use-the-index-luke.com/sql/where-clause', tags: ['database'] },
  { title: 'Web Application Security Checklist', url: 'https://owasp.org/www-project-web-security-testing-guide/', tags: ['security'] },
  { title: 'End-to-End Testing with Playwright', url: 'https://playwright.dev/docs/intro', tags: ['testing'] },
  { title: 'Microservices Architecture Patterns', url: 'https://microservices.io/patterns/', tags: ['architecture', 'devops'] },
  { title: 'CI/CD Pipeline Best Practices', url: 'https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment', tags: ['devops'] },
  { title: 'Python Virtual Environments', url: 'https://docs.python.org/3/library/venv.html', tags: ['python'] },
  { title: 'React State Management Patterns', url: 'https://react.dev/learn/managing-state', tags: ['react', 'architecture'] },
  { title: 'CSS Custom Properties Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties', tags: ['css'] },
  { title: 'Node.js Error Handling', url: 'https://nodejs.org/api/errors.html', tags: ['nodejs'] },
  { title: 'TypeScript Decorators', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html', tags: ['typescript'] },
  { title: 'SQLite Performance Tips', url: 'https://www.sqlite.org/np1queryprob.html', tags: ['database', 'performance'] },
  { title: 'API Security Guidelines', url: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html', tags: ['security', 'architecture'] },
  { title: 'React Testing Library Guide', url: 'https://testing-library.com/docs/react-testing-library/intro/', tags: ['testing', 'react'] },
  { title: 'Event-Driven Architecture', url: 'https://martinfowler.com/articles/201701-event-driven.html', tags: ['architecture'] },
  { title: 'GitHub Actions Tutorial', url: 'https://docs.github.com/en/actions/quickstart', tags: ['devops'] },
  { title: 'Python Decorators Explained', url: 'https://realpython.com/primer-on-python-decorators/', tags: ['python'] }
];

// Check how many items exist
const existingCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
if (existingCount >= 40) {
  console.log(`Items already seeded (${existingCount} items exist)`);
} else {
  const insertItem = db.prepare(`
    INSERT INTO items (id, title, url, status, notes, saved_at, read_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItemTag = db.prepare(`
    INSERT OR IGNORE INTO item_tags (item_id, tag_id)
    VALUES (?, ?)
  `);

  const now = new Date();
  let createdCount = 0;

  for (let i = 0; i < sampleItems.length; i++) {
    const item = sampleItems[i];
    const id = uuidv4();
    
    // Vary the saved_at dates over the past 60 days
    const savedAt = new Date(now);
    savedAt.setDate(savedAt.getDate() - Math.floor(Math.random() * 60));
    
    // 60% READ, 40% UNREAD
    const isRead = Math.random() < 0.6;
    const status = isRead ? 'READ' : 'UNREAD';
    
    // For read items, set readAt to sometime after savedAt
    let readAt = null;
    if (isRead) {
      readAt = new Date(savedAt);
      readAt.setDate(readAt.getDate() + Math.floor(Math.random() * 14) + 1);
      if (readAt > now) readAt = now;
    }
    
    // Some items have notes
    const notes = Math.random() < 0.3 
      ? `Notes for "${item.title}" - This looks like a great resource to review.`
      : null;

    insertItem.run(
      id,
      item.title,
      item.url,
      status,
      notes,
      savedAt.toISOString(),
      readAt ? readAt.toISOString() : null,
      savedAt.toISOString(),
      now.toISOString()
    );

    // Add tags
    for (const tagName of item.tags) {
      const tagId = tagMap.get(tagName);
      if (tagId) {
        insertItemTag.run(id, tagId);
      }
    }

    createdCount++;
  }

  console.log(`Seeded ${createdCount} reading items`);
}

closeDb();
console.log('Seed completed successfully.');

