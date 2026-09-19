# LinkX

**LinkX** is a full-stack URL shortener and click-analytics platform. Users create accounts, shorten long URLs (with optional custom aliases), share the short links, and track exactly who clicked, when, and from where.

This is a real, runnable application — a React SPA talking to a Hono REST API backed by PostgreSQL through Prisma. There is no mock data or fake backend anywhere in the stack.

## Features

- URL shortening with automatically generated, collision-checked short codes
- Optional custom aliases (with reserved-word and duplicate checks)
- Short-link redirects (`GET /:shortCode`) with real HTTP 302 responses
- Click tracking: timestamp, IP address, User-Agent, and referrer per click
- Per-link analytics: total clicks, last click, clicks-over-time chart, referrer & browser breakdowns
- JWT authentication with bcrypt password hashing
- PostgreSQL persistence via Prisma, with proper indexes and cascading deletes
- Paginated, searchable, sortable "My Links" table
- Centralized Zod validation and a consistent `{ success, data | error }` API response shape
- Responsive, dashboard-style React UI (Tailwind CSS)

## Tech stack

| Layer          | Technology                                  |
| -------------- | -------------------------------------------- |
| Frontend       | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend        | Node.js, TypeScript, Hono, Zod, JWT, bcryptjs |
| ORM / Database | Prisma, PostgreSQL                          |
| Tooling        | npm, ESLint, Prettier, Vitest                |

## Architecture

```
React (Vite dev server, :5173)
        │  fetch/axios, JSON over HTTPS, Authorization: Bearer <JWT>
        ▼
Hono REST API (:3000)
        │
        ▼
Controllers  →  Services (AuthService / UrlService / AnalyticsService)
        │
        ▼
   Prisma Client
        │
        ▼
   PostgreSQL
```

The frontend never talks to the database directly — every read or write goes through the versioned REST API in `backend/src/routes`. See `backend/README.md` for the full endpoint reference and `frontend/README.md` for the client structure.

## Project structure

```
linkx/
├── backend/
│   ├── src/
│   │   ├── config/        # env loader, Prisma client singleton
│   │   ├── controllers/   # request parsing → service calls → response shaping
│   │   ├── middleware/    # authMiddleware (JWT), centralized errorHandler
│   │   ├── routes/        # Hono routers (auth, urls, redirect)
│   │   ├── services/      # business logic + Prisma queries
│   │   ├── validators/    # Zod schemas (register, login, create/update URL, pagination)
│   │   ├── utils/         # JWT, password hashing, short-code generation, API responses
│   │   ├── types/         # shared types + ApiError
│   │   ├── app.ts         # Hono app wiring (CORS, routes, error handler)
│   │   └── server.ts      # @hono/node-server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # User / Url / Click models
│   │   └── seed.ts        # demo/dev seed data
│   ├── tests/             # Vitest + Hono's built-in test client
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Button, Input, Card, UrlTable, CreateUrlForm, ...
│   │   ├── pages/         # Landing, Login, Register, Dashboard, UrlsPage, UrlAnalytics, NotFound
│   │   ├── layouts/       # DashboardLayout (sidebar nav)
│   │   ├── hooks/         # useAuth
│   │   ├── services/      # api.ts, authApi.ts, urlApi.ts, analyticsApi.ts
│   │   ├── context/       # AuthContext
│   │   ├── types/         # shared frontend types
│   │   ├── utils/         # formatting helpers
│   │   ├── App.tsx        # routes
│   │   └── main.tsx       # entry point
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── docker-compose.yml      # PostgreSQL only — backend/frontend run locally
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 14+ (or Docker, via the provided `docker-compose.yml`)

## Installation

```bash
git clone <your-fork-url> linkx
cd linkx

cd backend
npm install

cd ../frontend
npm install
```

## Environment setup

**Backend** — `backend/.env` (copy from `backend/.env.example`):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/linkx"
JWT_SECRET="replace_with_secure_secret"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
SHORT_URL_BASE="http://localhost:3000"
```

**Frontend** — `frontend/.env` (copy from `frontend/.env.example`):

```env
VITE_API_URL="http://localhost:3000"
```

## Database setup

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

(Or point `DATABASE_URL` at your own PostgreSQL instance — just make sure the credentials match.)

Then, from `backend/`:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed     # optional — creates a demo user: demo@linkx.dev / Password123!
```

`npx prisma studio` opens a GUI to browse the `users`, `urls`, and `clicks` tables directly.

## Running the application

```bash
# 1. PostgreSQL
docker compose up -d

# 2. Backend (from backend/)
npm run dev
# → http://localhost:3000

# 3. Frontend (from frontend/, in a second terminal)
npm run dev
# → http://localhost:5173
```

Visit `http://localhost:5173`, register an account (or log in with the seeded demo user), and start shortening links.

## Testing

```bash
cd backend
npm test
```

The suite (`tests/auth.test.ts`, `tests/url.test.ts`) uses Vitest and Hono's built-in `app.request()` test client — no separate server process needed, but it does hit whatever `DATABASE_URL` is configured, so point it at a disposable/dev database first. It covers registration, login (valid/invalid credentials), URL creation, custom aliases, duplicate/reserved-alias rejection, invalid URLs, redirect + click tracking, 404 on unknown codes, cross-user access (403), deletion, deleting a non-existent URL (404), and missing-token requests (401).

## API endpoint summary

| Method | Endpoint                  | Auth | Purpose |
| ------ | -------------------------- | ---- | ------- |
| POST   | `/api/auth/register`       | No   | Create an account, returns `{ user, token }` |
| POST   | `/api/auth/login`          | No   | Log in, returns `{ user, token }` |
| GET    | `/api/auth/me`             | Yes  | Current user's profile |
| POST   | `/api/urls`                | Yes  | Create a short URL (optional `customAlias`, `expiresAt`) |
| GET    | `/api/urls`                | Yes  | List the current user's URLs — supports `page`, `limit`, `search`, `sortBy`, `sortOrder` |
| GET    | `/api/urls/summary`        | Yes  | Dashboard summary: total links, total clicks, top link, recent links |
| GET    | `/api/urls/:id`            | Yes  | Get one URL (owner-only) |
| GET    | `/api/urls/:id/analytics`  | Yes  | Total clicks, last click, clicks-by-date, referrer/browser breakdown |
| DELETE | `/api/urls/:id`            | Yes  | Delete a URL (owner-only) — cascades to its `Click` rows |
| GET    | `/:shortCode`               | No   | Resolve a short code/alias, track the click, `302` redirect |

Full request/response examples and error codes are documented in `backend/README.md`.

## How the frontend talks to the backend

Every network call in the React app goes through `frontend/src/services/api.ts`, a single Axios instance configured with `VITE_API_URL` as its base URL. A request interceptor attaches `Authorization: Bearer <token>` (the token comes from `localStorage`, managed by `AuthContext`) to every outgoing request. `authApi.ts`, `urlApi.ts`, and `analyticsApi.ts` wrap that instance with typed functions (`urlApi.createUrl()`, `urlApi.getUrls()`, `analyticsApi.getAnalytics()`, etc.) so components never call `axios`/`fetch` directly. Errors are normalized into an `ApiClientError` with the backend's `code`/`message`, which pages use to show field-level or form-level validation messages.

## Database relationships

- **`User` 1—\* `Url`** — a user can own many shortened URLs (`onDelete: Cascade`: deleting a user removes their URLs).
- **`Url` 1—\* `Click`** — each URL can have many recorded clicks (`onDelete: Cascade`: deleting a URL removes its click history).
- Indexes: `User.email`, `Url.shortCode`, `Url.customAlias`, `Url.userId`, `Click.urlId`, `Click.clickedAt` — covering the lookups the app performs most (auth, redirect resolution, per-user listing, analytics aggregation).

## URL redirect + click tracking flow

1. A browser (or anyone) requests `GET http://localhost:3000/<shortCode>`.
2. The backend looks the code up against both `shortCode` and `customAlias`.
3. Not found → `404`. Past `expiresAt` → `410`.
4. Otherwise, a single Prisma `$transaction` **creates a `Click` row** (IP, User-Agent, referer) **and increments `Url.clickCount`** together, so concurrent redirects can never leave the click count out of sync with the actual click history.
5. The API responds with an HTTP `302 Found` redirect to `originalUrl`.
6. The analytics page (`/analytics/:id`) reads `GET /api/urls/:id/analytics`, which aggregates the `Click` rows into a clicks-by-date series and referrer/browser summaries — all computed from real stored data, never fabricated.

## Future improvements

- QR code generation for each short link
- Password-protected links
- Geographic (IP-based) analytics
- Rate limiting on the redirect and auth endpoints
- Bulk link import/export
