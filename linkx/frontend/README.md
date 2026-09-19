# LinkX Frontend

React + TypeScript + Vite + Tailwind CSS dashboard for the LinkX URL shortener.

## Setup

```bash
npm install
cp .env.example .env    # point VITE_API_URL at the backend
npm run dev
```

The app starts on `http://localhost:5173` and expects the backend API (see `../backend`) running at the URL configured in `VITE_API_URL`.

## Structure

- `src/pages` — one component per route (Landing, Login, Register, Dashboard, My Links, Analytics, 404).
- `src/layouts` — `DashboardLayout` (sidebar navigation, used by every authenticated page).
- `src/components` — reusable UI primitives (`Button`, `Input`, `Card`, `UrlTable`, `CreateUrlForm`, `CopyButton`, `StatCard`, `EmptyState`, `Spinner`, `ProtectedRoute`).
- `src/context` / `src/hooks` — `AuthContext` + `useAuth` centralize the current user, login/register/logout, and token handling.
- `src/services` — the only place that talks to the API: `api.ts` (axios instance + token storage), `authApi.ts`, `urlApi.ts`, `analyticsApi.ts`.
- `src/types` — TypeScript types shared across the app, mirroring the backend's response shapes.

## Scripts

| Command           | Description                    |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start the Vite dev server        |
| `npm run build`    | Type-check and build for production |
| `npm run preview`  | Preview the production build     |
| `npm run lint`     | ESLint                           |
| `npm run format`   | Prettier                         |

## Protected routes

`/dashboard`, `/urls`, and `/analytics/:id` are wrapped in `<ProtectedRoute>`, which redirects to `/login` if there is no authenticated user (checked via `GET /api/auth/me` on load, using the JWT stored in `localStorage`).
