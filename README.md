# SprintDesk

SprintDesk is a sprint management dashboard for software teams. You log in, manage tasks on a Kanban board, and see charts built from those tasks. It is a single page application built with React and TypeScript.

This project was built as a frontend assignment.

## Features

**Authentication**

- Login using the DummyJSON auth API
- Access token is kept in memory, refresh token is stored in the browser
- Token refresh happens automatically when the access token expires, and the failed request is sent again
- Dashboard, board and analytics pages cannot be opened without logging in
- Session stays active after a page refresh
- Remember me option keeps you logged in for 30 days
- Password strength indicator on the login form

**Kanban board**

- Four columns: Backlog, In Progress, Review and Done
- Drag and drop cards using the mouse or the keyboard
- Task counts update as cards move
- Click a card to open a drawer with full details
- Edit a task and add comments
- Create tasks with title, column, priority, assignee and due date
- Delete a task after a confirmation step
- Filter by priority or assignee
- Undo the last move
- Board state is saved in the browser, so it stays after a refresh

**Analytics**

- Task status across the four columns
- Priority breakdown inside each column
- Sprint velocity, grouped by the week a task is due
- Completion trend over time
- All four charts use real board data and update when the board changes

**Notifications**

- Checks for new items every 15 seconds
- Bell icon shows the unread count
- Keeps the last 20 notifications
- Mark one as read or mark all as read
- Polling stops when the browser tab is hidden and starts again when you come back
- A toast appears when something new arrives and the panel is closed

**Other**

- Light and dark theme
- Works on mobile, tablet and desktop
- Component library built from scratch, no UI library used

## Tech stack

| Purpose | Library | Version |
| --- | --- | --- |
| UI | React | 19.2 |
| Language | TypeScript (strict mode) | 6.0 |
| Build tool | Vite | 8.2 |
| Server data | TanStack Query | 5.101 |
| App state | Zustand | 5.0 |
| Styling | Tailwind CSS | 3.4 |
| Routing | React Router | 7.18 |
| Charts | Recharts | 3.10 |
| Drag and drop | dnd-kit | 6.3 |
| HTTP client | Axios | 1.19 |
| Testing | Vitest + React Testing Library | 4.1 / 16.3 |

## Setup

You need Node.js version 20.19 or higher.

Clone the repository:

```bash
git clone https://github.com/akritiofficial26/sprintdesk.git
cd sprintdesk
```

Install the packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs at http://localhost:5173

### Environment variables

No environment variables are needed. Both APIs used in this project are public and do not need an API key.

There is one optional variable in `.env.example`. `VITE_ACCESS_TOKEN_TTL_MINS` sets how long the access token lasts, in minutes. The default is 30. Setting it to 1 makes the token expire quickly, which is useful if you want to see the automatic refresh working.

### Login details

The app uses the DummyJSON test account:

```
Username: emilys
Password: emilyspass
```

The login form field is labelled Email, but the value is sent as a username. DummyJSON does not support login by email.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Type checks the project and builds it into the `dist` folder |
| `npm run preview` | Serves the built files so you can check the production version |
| `npm run test` | Runs all tests once |
| `npm run test:watch` | Runs tests and reruns them when files change |
| `npm run lint` | Runs the linter |

## Pages

| Route | Page | Access |
| --- | --- | --- |
| `/login` | Login form | Public |
| `/dashboard` | Summary cards, sprint distribution and a sortable table of all tasks | Login required |
| `/board` | Kanban board | Login required |
| `/analytics` | Four charts | Login required |

Opening `/` or any unknown URL sends you to the dashboard.

## Folder structure

```
src/
  components/
    Layout.tsx        Sidebar, header and page frame
    ui/               Button, Input, Select, Modal, Toast, DataTable,
                      Skeleton, FullScreenLoader, ThemeToggle
  features/
    auth/             Login page, auth API calls, session restore
    board/            Kanban board, task card, column, drawer, modals
    analytics/        Charts and the functions that calculate chart data
    dashboard/        Summary cards and the task table
    notifications/    Bell, panel and the polling hook
  lib/
    axios.ts          Axios setup and the token refresh logic
  routes/
    AppRouter.tsx     Route list
    ProtectedRoute.tsx  Guard for pages that need a login
  store/              Five Zustand stores: auth, board, notification, toast, theme
  types/              Shared TypeScript types
docs/                 Architecture and API documentation
design/               Design tokens for light and dark theme
```

## APIs used

Two public APIs. Neither one needs a key.

**DummyJSON** (`https://dummyjson.com`)

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/login` | Log in and get the access and refresh tokens |
| `POST /auth/refresh` | Get a new access token |
| `GET /auth/me` | Get the logged in user |

**JSONPlaceholder** (`https://jsonplaceholder.typicode.com`)

| Endpoint | Purpose |
| --- | --- |
| `GET /todos?_limit=30` | The 30 tasks shown on the board |
| `GET /users` | Names used as task assignees |
| `GET /posts` | Items treated as notifications |

The todos API only returns an id, a title and a completed flag. Priority, assignee and due date are not part of that data, so they are worked out from the task id using a fixed rule. The same task always gets the same values, so the board looks the same every time it loads.

Full request and response details are in `docs/API.md` and `docs/openapi.yaml`.

## How the data flows

The board is fetched once when you open any of the three private pages. It is then saved into a Zustand store, and the dashboard and analytics pages read from that same store.

This means moving a card on the board updates the dashboard numbers and the analytics charts straight away, without any extra API call.

The store is saved to localStorage. When you refresh the page, the saved board is loaded instead of fetching the API again, so your changes are not lost.

## State management

The project uses two tools for two different kinds of data.

TanStack Query handles data coming from an API. It takes care of caching, loading and error states, and repeating the notification request on a timer.

Zustand holds data the app owns after it arrives. There are five stores:

| Store | Holds | Saved in browser |
| --- | --- | --- |
| auth | User details and access token | Only the refresh token |
| board | Tasks, column order, filters, last move | Yes |
| notification | Last 20 notifications and read state | Yes |
| toast | Messages currently on screen | No |
| theme | Light or dark | Yes |

## Theming

Colours are not written directly inside components. Every component uses a name such as `surface`, `on-surface` or `primary`, and each name has one value for the light theme and one for the dark theme. Adding the `dark` class to the page changes all of them together.

A small script in `index.html` reads the saved theme before the page is drawn, so the correct theme shows straight away without a flash of the wrong colours.

## Testing

There are 77 tests across 12 files. Run them with `npm run test`.

| File | Covers |
| --- | --- |
| `store/boardStore.test.ts` | Adding, moving and deleting tasks, and undo |
| `store/authStore.test.ts` | Where the refresh token is saved and the 30 day expiry |
| `store/notificationStore.test.ts` | Ignoring duplicates, the 20 item limit and read state |
| `store/toastStore.test.ts` | Showing, dismissing and auto dismissing toasts |
| `lib/axios.test.ts` | Token refresh, retry, and what happens when refresh fails |
| `features/analytics/analyticsSelectors.test.ts` | The four chart calculations |
| `components/ui/useToast.test.tsx` | The useToast hook and the toast container |
| `components/ui/DataTable.test.tsx` | Sorting, keyboard use and screen reader labels |
| `components/ui/Modal.test.tsx` | Focus staying inside the dialog, Escape and backdrop clicks |
| `components/ui/Skeleton.test.tsx` | Loading placeholder behaviour |
| `components/ui/FullScreenLoader.test.tsx` | The full screen loading state |
| `features/dashboard/DashboardPage.test.tsx` | Summary cards, the task table and sorting |

## Performance

- Each page is loaded only when you open it, so the charts library is downloaded only when you visit the analytics page
- `React.memo` is used on the task card and the board column, so editing one task redraws one card instead of all of them
- `useCallback` is used for the functions passed to those components, otherwise the memo would not work
- `useMemo` is used for the chart calculations, the filtered columns and the table sorting
- The board is fetched once and shared by three pages
- The icon font is loaded with only the icons this app uses, which brings it down from about 4 MB to about 4 KB
- Loading skeletons are the same size as the real content, so nothing jumps when the data arrives

## Accessibility

- Drag and drop works with the keyboard. Focus a drag handle, press Space to pick the card up, use the arrow keys to move it, press Space to drop it and Escape to cancel
- Modals and the task drawer keep focus inside them and return focus to the button that opened them
- Every form field has a label
- Icon only buttons have a hidden text label for screen readers
- The sortable table announces which column is sorted and in which direction
- Toasts are announced by screen readers
- The loading animation stops for users who have reduced motion turned on

## Documentation

| File | Contents |
| --- | --- |
| `docs/ARCHITECTURE.md` | How the project is structured and how data moves through it |
| `docs/API.md` | Every endpoint with request and response examples |




