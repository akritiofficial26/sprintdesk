# API Documentation

SprintDesk has no backend of its own. It uses two public APIs, and neither one needs an API key.

This file explains each endpoint in plain terms. The same information in OpenAPI format is in [openapi.yaml](./openapi.yaml), which you can open in any Swagger viewer.

## All endpoints

| Method | Endpoint | API | Needs login | Called from |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | DummyJSON | No | `features/auth/authApi.ts` |
| POST | `/auth/refresh` | DummyJSON | No | `lib/axios.ts` and `features/auth/useSessionInit.ts` |
| GET | `/auth/me` | DummyJSON | Yes | `features/auth/authApi.ts` |
| GET | `/todos?_limit=30` | JSONPlaceholder | No | `features/board/boardApi.ts` |
| GET | `/users` | JSONPlaceholder | No | `features/board/boardApi.ts` |
| GET | `/posts?_start={n}&_limit=5` | JSONPlaceholder | No | `features/notifications/notificationApi.ts` |

There are two Axios instances set up in `src/lib/axios.ts`.

| Instance | Base URL | What it adds |
| --- | --- | --- |
| `dummyJsonApi` | `https://dummyjson.com` | Adds the bearer token to every request, and refreshes the token when a request fails with 401 |
| `jsonPlaceholderApi` | `https://jsonplaceholder.typicode.com` | Nothing, because this data is public |

## Authentication

### POST /auth/login

Sends the username and password and gets back the user details plus two tokens.

The login form field is labelled Email, but the value is sent as `username`. DummyJSON does not support logging in with an email address.

`expiresInMins` comes from the `VITE_ACCESS_TOKEN_TTL_MINS` environment variable. The default is 30.

Request:

```bash
curl -X POST https://dummyjson.com/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "username": "emilys", "password": "emilyspass", "expiresInMins": 30 }'
```

Response, 200 OK:

```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  "image": "https://dummyjson.com/icon/emilys/128",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response, 400 Bad Request:

```json
{ "message": "Invalid credentials" }
```

A failed login shows an error message above the form. What the user typed is not cleared.

### Where each token is stored

| Token | Stored in | Reason |
| --- | --- | --- |
| Access token | Memory only, inside the Zustand auth store | It is never written to browser storage, so a script cannot read it back later |
| Refresh token, remember me ticked | localStorage, with a 30 day expiry time | The session survives closing the browser, and is rejected once 30 days have passed |
| Refresh token, remember me not ticked | sessionStorage | The session survives a page refresh but ends when the tab is closed |

All of this goes through one small wrapper called `refreshTokenStorage` in `src/store/authStore.ts`. If the app ever gets a real backend and moves to httpOnly cookies, only that wrapper needs to change.

### POST /auth/refresh

Exchanges a refresh token for a new access token. It is called from two places: the Axios interceptor when a request fails, and the session restore on page load.

Request:

```bash
curl -X POST https://dummyjson.com/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "expiresInMins": 30 }'
```

Response, 200 OK:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The refresh token is replaced each time, and the new one is saved over the old one.

If this request fails, the app clears the session and sends the user to the login page.

### GET /auth/me

Returns the logged in user. It does not return tokens. It is called after login and after every session restore, to fill in the user details in the auth store.

Request:

```bash
curl https://dummyjson.com/auth/me \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## How the token refresh works

Access tokens expire. Instead of sending the user back to the login page, the app fixes it quietly and the page never finds out.

This is written in `src/lib/axios.ts` and tested in `src/lib/axios.test.ts`.

```mermaid
sequenceDiagram
    participant P as Page
    participant A as Axios interceptor
    participant S as DummyJSON

    P->>A: Ask for data
    A->>S: Request with old token
    S-->>A: 401, token expired
    A->>S: Ask for a new token
    S-->>A: New access and refresh token
    A->>S: Send the first request again
    S-->>A: Data
    A-->>P: Data
```

Three things make this work properly, and each one has a test:

1. A request is only retried once. The request is marked after the first retry, so a second failure is passed back to the caller instead of looping forever.
2. If several requests fail at the same time, only one refresh is sent. The first failure starts the refresh and the rest wait in a queue. When the new token arrives they are all sent again. Without this, ten expired requests would trigger ten refresh calls.
3. If the refresh itself fails, the queue is rejected, the session is cleared and the user is sent to the login page.

## Board data

### GET /todos and GET /users

Both are requested at the same time by `fetchBoardTasks()`.

Request:

```bash
curl 'https://jsonplaceholder.typicode.com/todos?_limit=30'
curl 'https://jsonplaceholder.typicode.com/users'
```

Response from `/todos`, 200 OK:

```json
[
  { "userId": 1, "id": 1, "title": "delectus aut autem", "completed": false }
]
```

A todo only has an id, a title and a completed flag. A sprint task needs more than that, so the missing fields are worked out from the task id using a fixed rule:

| Task field | How it is set |
| --- | --- |
| `id` and `title` | Taken from the todo. The title gets a capital first letter. |
| `columnId` | `done` if completed, otherwise backlog, in progress or review based on `id % 3` |
| `priority` | Low, medium or high based on `id % 3` |
| `assignee` | The matching user name from `/users` |
| `dueDate` | Today plus `((id * 3) % 21) - 7` days |
| `completedAt` | The due date, for tasks that arrive already completed |

The rule is fixed, not random. Task 7 always gets the same priority and the same due date. This keeps the board realistic and makes it the same on every machine, which the tests rely on.

Only `id` and `name` are used from the `/users` response. The rest is ignored.

### When it is fetched

The board is requested once. All three private pages share the same query key, so opening `/dashboard`, `/board` and `/analytics` does not fetch it three times.

The board store saves itself to localStorage and only fills itself the first time. On a page refresh the saved board is loaded instead of fetching again, so local changes are kept.

Adding, editing, moving and deleting tasks are local only. JSONPlaceholder accepts write requests but does not store anything, so sending them would have no effect. After the first load, the Zustand store is the source of truth.

## Notifications

### GET /posts

Requested every 15 seconds by `useNotificationPolling`. Any post id that is not already in the store becomes a new notification.

Request:

```bash
curl 'https://jsonplaceholder.typicode.com/posts?_start=0&_limit=5'
```

Response, 200 OK:

```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident",
    "body": "quia et suscipit suscipit recusandae"
  }
]
```

The assignment asked for `?_limit=5`. That endpoint always returns the same 100 posts and never changes, so asking for the same five posts would produce one set of notifications and then nothing ever again. Instead the app keeps a position value, moves it forward by 5 after each request and wraps back to the start at the end. This way new ids keep arriving while the app is open. Once every post has been seen, polling goes quiet, which is a reasonable end point for a simulation.

Polling stops while the browser tab is hidden and starts again when it becomes visible. This comes from the `refetchIntervalInBackground` setting in TanStack Query, which already tracks tab visibility, so no extra listener was written.

## Error handling

| Situation | What happens |
| --- | --- |
| A DummyJSON request returns 401 | The token is refreshed and the request is sent again. The page never sees the failure. |
| The refresh fails, or there is no refresh token | The session is cleared and the user is sent to the login page. |
| Wrong login details | An error message appears above the form and the typed values are kept. |
| The board request fails | The board page shows an error message asking the user to refresh. |
| A notification request fails | Nothing is shown. TanStack Query tries once more, then waits for the next 15 second tick. A missed background check is not worth interrupting the user for. |

## Environment variables

No environment variables are required, because both APIs are public and need no key.

There is one optional variable, listed in `.env.example`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_ACCESS_TOKEN_TTL_MINS` | 30 | How many minutes the access token lasts. Set it to 1 to make the token expire quickly, which makes the automatic refresh easy to see while testing. |

No passwords, keys or other credentials are stored in this repository.
