# SprintDesk

A sprint management dashboard built with React 18/19 + TypeScript (strict) + Vite.

## Status — Phase 1

**Scope of this phase: project skeleton, the full authentication flow (Task
01), and the applied SprintDesk design system (light theme).**
Board, Analytics, and Notifications are placeholder pages, styled to match
the design system, pending their own build phases.

## Setup

```bash
npm install
npm run dev         # http://localhost:5173
npm run build        # production build to dist/
npm run test          # run unit tests once
npm run test:watch    # watch mode
```

No environment variables are required — both APIs used (DummyJSON,
JSONPlaceholder) are public and keyless. `.env.example` documents where
config would live if that changed.

### Test login

DummyJSON test account: username `emilys`, password `emilyspass`.
(The login form's "email" field is mapped to DummyJSON's `username` field —
DummyJSON doesn't support real email login. See `authApi.ts`.)

## Design system

The UI implements the **"Velocity Professional" / light** design system
(`design/velocity_professional_light.DESIGN.md`), sourced from the Stitch
mockups for this project. All colors, type scale, spacing, and radii in
`tailwind.config.js` are the literal design tokens from that spec — nothing
was eyeballed. The dark variant (`design/velocity_professional_dark.DESIGN.md`)
is included for reference; a light/dark theme switch (a functional
requirement of the assignment) is not yet wired up — see Known limitations.

Icons use Google's Material Symbols Outlined font, matching the mockups.

## Architecture

```
src/
  components/
    ui/           Reusable design-system primitives (Button, Input, FullScreenLoader)
    Layout.tsx    Authenticated shell: fixed sidebar nav + user card + logout
  features/
    auth/         Login page, auth API calls, session-restore hook, password strength
    board/        Kanban board (stub — later phase)
    analytics/    Charts (stub — later phase)
    notifications/ (later phase)
  lib/
    axios.ts      Axios instances + bearer-token/refresh interceptor
  routes/
    AppRouter.tsx Route table, lazy-loaded pages
    ProtectedRoute.tsx  Auth guard
  store/
    authStore.ts  Zustand store: access token in memory, refresh token in
                   localStorage/sessionStorage depending on "Remember me"
  types/          Shared TS types
design/           Source design tokens (light + dark DESIGN.md)
```

### Auth flow

- **Access token**: kept only in memory (Zustand state), never persisted —
  reduces XSS exfiltration surface vs localStorage.
- **Refresh token storage**: isolated behind a small `refreshTokenStorage`
  wrapper so it can be swapped for an httpOnly cookie-based flow later
  without touching call sites.
  - **Remember me checked** → refresh token + a 30-day expiry timestamp go
    into `localStorage`. The session survives closing the browser, and is
    rejected client-side once the 30-day window lapses.
  - **Remember me unchecked** → refresh token goes into `sessionStorage`.
    It survives an in-page refresh (per the assignment's requirement) but is
    cleared the moment the tab/browser closes.
- **Interceptor** (`lib/axios.ts`): attaches `Authorization: Bearer <token>`
  to every DummyJSON request. On a 401, it refreshes the token once, replays
  the original request, and queues any other requests that 401 while a
  refresh is already in flight (avoids firing parallel refresh calls).
- **Session restore on page load**: `useSessionInit` reads the stored
  refresh token (whichever store currently holds it), exchanges it for a new
  access token, fetches `/auth/me`, and rehydrates the store — this is what
  keeps you logged in across a refresh. A full-screen loader is shown until
  this resolves.
- **Route protection**: `ProtectedRoute` redirects unauthenticated users to
  `/login` (preserving the intended destination); `/login` itself redirects
  away if already authenticated.

### Bonus items implemented

- **Remember me** with real (not cosmetic) 30-day persistence, described
  above.
- **Password strength indicator** (`features/auth/passwordStrength.ts`) —
  a lightweight, dependency-free heuristic (length, case mix, digits,
  symbols) driving a live strength bar under the password field.

## Known limitations (to be addressed in later phases)

- Token expiry is currently simulated with a short `expiresInMins: 1` on
  login purely to make the refresh flow observable during a demo — this
  should be a normal duration in a real deployment.
- Board, Analytics, and Notifications are placeholder pages, styled to the
  design system, pending their own build phases.
- Light/dark theme switching (a functional requirement) is not implemented
  yet — the app currently ships the light theme only. Both token sets exist
  in `design/`, so wiring up `dark:` classes + a toggle is scoped, not
  blocked.

## Tech stack

React 19 (satisfies "18+"), TypeScript strict, Vite, TanStack Query v5,
Zustand, Tailwind CSS v3 (custom design tokens, no component library),
React Router v6/v7, @dnd-kit/core (installed, board not yet built),
Recharts, Vitest + React Testing Library.
