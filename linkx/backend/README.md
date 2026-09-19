# LinkX Backend

REST API for the LinkX URL Shortener & Click Analytics Platform, built with **Hono**, **TypeScript**, **Prisma**, and **PostgreSQL**.

## Architecture

```
Route → Controller → Service → Prisma → PostgreSQL
```

- **routes/** — Hono routers; wire URLs to controllers, attach middleware.
- **controllers/** — parse/validate the request, call a service, shape the response. No business logic.
- **services/** — all business logic and Prisma queries (`AuthService`, `UrlService`, `AnalyticsService`).
- **middleware/** — `authMiddleware` (JWT verification, reused across every protected route) and the centralized `errorHandler`.
- **validators/** — Zod schemas, one source of truth for input validation.
- **utils/** — JWT signing/verification, bcrypt hashing, short-code generation, and the standard API response helpers.

## Setup

```bash
npm install
cp .env.example .env      # then edit DATABASE_URL / JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed       # optional demo data
npm run dev
```

The API starts on `http://localhost:3000` (see `PORT` in `.env`).

## Environment variables

| Variable          | Description                                   |
| ----------------- | ---------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                   |
| `JWT_SECRET`      | Secret used to sign JWTs                       |
| `JWT_EXPIRES_IN`  | Token lifetime (e.g. `7d`)                     |
| `PORT`            | API port (default `3000`)                      |
| `FRONTEND_URL`    | Allowed CORS origin                            |
| `SHORT_URL_BASE`  | Base URL used when building `shortUrl` in responses |

## Scripts

| Command                 | Description                          |
| ------------------------ | ------------------------------------- |
| `npm run dev`             | Start with hot reload (tsx)          |
| `npm run build`           | Compile TypeScript to `dist/`        |
| `npm start`               | Run the compiled server              |
| `npm run prisma:generate` | Regenerate the Prisma client         |
| `npm run prisma:migrate`  | Create/apply a migration             |
| `npm run prisma:studio`   | Open Prisma Studio                   |
| `npm run prisma:seed`     | Load development/demo data           |
| `npm test`                | Run the Vitest test suite            |
| `npm run lint`            | ESLint                               |
| `npm run format`          | Prettier                             |

Tests run against whatever `DATABASE_URL` is configured — point it at a disposable/dev database before running `npm test`, since the suite creates real users and URLs.

## API Reference

All responses follow one of two shapes:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

### Auth

| Method | Endpoint             | Auth | Body                              | Success |
| ------ | --------------------- | ---- | ---------------------------------- | ------- |
| POST   | `/api/auth/register`  | No   | `{ name, email, password }`        | 201 `{ user, token }` |
| POST   | `/api/auth/login`     | No   | `{ email, password }`              | 200 `{ user, token }` |
| GET    | `/api/auth/me`        | Yes  | —                                   | 200 `{ id, name, email, createdAt }` |

Errors: `422 VALIDATION_ERROR`, `409 CONFLICT` (register, duplicate email), `401 UNAUTHORIZED` (login, bad credentials).

### URLs

All endpoints below require `Authorization: Bearer <token>`.

| Method | Endpoint                    | Body / Query                                             | Success |
| ------ | ----------------------------- | ---------------------------------------------------------- | ------- |
| POST   | `/api/urls`                  | `{ originalUrl, customAlias?, expiresAt? }`                | 201 `{ id, originalUrl, shortCode, customAlias, shortUrl, clickCount, ... }` |
| GET    | `/api/urls`                  | `?page=1&limit=10&search=&sortBy=createdAt&sortOrder=desc` | 200 `{ urls: [...], pagination: {...} }` |
| GET    | `/api/urls/summary`          | —                                                            | 200 `{ totalLinks, totalClicks, topLink, recentLinks }` |
| GET    | `/api/urls/:id`              | —                                                            | 200 url object |
| GET    | `/api/urls/:id/analytics`    | —                                                            | 200 `{ url, totalClicks, latestClickAt, clicksByDate, referrerSummary, userAgentSummary }` |
| DELETE | `/api/urls/:id`              | —                                                            | 204 (no body) |

Errors: `422 VALIDATION_ERROR` (bad URL/alias), `409 CONFLICT` (duplicate alias), `409 RESERVED_ALIAS` (reserved word), `403 FORBIDDEN` (someone else's URL), `404 NOT_FOUND`.

### Redirect

| Method | Endpoint       | Description |
| ------ | --------------- | ------------ |
| GET    | `/:shortCode`  | Looks up the code (short code or custom alias), records a `Click`, increments `clickCount`, and issues a `302` redirect to `originalUrl`. Returns `404` if not found, `410` if expired. |

### Example: create a short URL

```
POST /api/urls
Authorization: Bearer <token>
Content-Type: application/json

{ "originalUrl": "https://github.com" }
```

```json
{
  "success": true,
  "data": {
    "id": "clx1...",
    "originalUrl": "https://github.com",
    "shortCode": "aB82kPq",
    "customAlias": null,
    "shortUrl": "http://localhost:3000/aB82kPq",
    "clickCount": 0,
    "createdAt": "2026-09-17T10:00:00.000Z"
  }
}
```

## Redirect + click tracking flow

1. Browser hits `GET /:shortCode` on the API host.
2. `RedirectController` calls `UrlService.resolveAndTrack`, which looks the code up against both `shortCode` and `customAlias`.
3. If missing → `404`. If past `expiresAt` → `410`.
4. Otherwise, a single Prisma `$transaction` creates a `Click` row (IP, User-Agent, Referer) **and** increments `Url.clickCount`, so the two never drift apart even under concurrent traffic.
5. The API responds with an HTTP `302` redirect to `originalUrl`.

## Database relationships

- `User 1—* Url` (`onDelete: Cascade` — deleting a user removes their URLs).
- `Url 1—* Click` (`onDelete: Cascade` — deleting a URL removes its click history).
- Indexes on `User.email`, `Url.shortCode`, `Url.customAlias`, `Url.userId`, `Click.urlId`, and `Click.clickedAt` keep lookups and analytics aggregation fast.
