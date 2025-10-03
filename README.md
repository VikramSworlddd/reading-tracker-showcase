# Reading Tracker

A clean, single-user reading list tracker built as a portfolio project. Track articles, tutorials, and resources you want to read or have already read.

## Features

- 📚 Track reading items with URL, title, notes, and tags
- 🏷️ Organize with customizable tags
- ✅ Mark items as Read/Unread
- 🔍 Search by title, URL, or notes
- 📊 Summary dashboard with reading stats
- 🔐 Secure authentication with JWT in httpOnly cookies

## Tech Stack

- **Frontend**: React (Vite) + React Router + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Validation**: Zod
- **Auth**: bcrypt + JWT

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd reading-tracker

# Install dependencies
npm install
```

### Environment Setup

Create the following `.env` files:

**apps/api/.env**
```env
PORT=4006
JWT_SECRET=dev_secret_change_me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
DB_PATH=./data/dev.db
```

**apps/web/.env**
```env
VITE_API_BASE=/api
```

> ⚠️ For production, use a strong random JWT_SECRET (32+ characters).

### Database Setup

```bash
# Create tables and indexes
npm run db:migrate

# Seed admin user, tags, and sample items
npm run db:seed
```

### Development

```bash
# Run both API and web concurrently
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4006

### Login

Use the admin credentials from your `apps/api/.env`:
- Email: `admin@example.com`
- Password: `ChangeMe123!`

## Project Structure

```
reading-tracker/
├── apps/
│   ├── api/                 # Express API
│   │   ├── src/
│   │   │   ├── db/          # Database connection, migrations, seeds
│   │   │   ├── middleware/  # Auth, validation, error handling
│   │   │   ├── routes/      # API routes
│   │   │   └── schemas/     # Zod validation schemas
│   │   └── data/            # SQLite database (gitignored)
│   └── web/                 # React frontend
│       └── src/
│           ├── components/  # Reusable components
│           ├── context/     # Auth context
│           └── pages/       # Route pages
└── package.json             # Root workspace config
```

## API Routes

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Items (protected)
- `GET /api/items` - List items (with pagination, search, filters)
- `POST /api/items` - Create item
- `GET /api/items/:id` - Get item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/status` - Update item status

### Tags (protected)
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Rename tag
- `DELETE /api/tags/:id` - Delete tag

### Metrics (protected)
- `GET /api/metrics/summary` - Get reading stats

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both API and web in development |
| `npm run build` | Build both API and web for production |
| `npm run db:migrate` | Create/update database schema |
| `npm run db:seed` | Seed admin user and sample data |

## License

MIT

