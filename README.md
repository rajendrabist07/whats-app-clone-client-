# WhatsApp MERN Client

React frontend for a real-time WhatsApp-style chat application. The client handles authentication, protected routing, chat navigation, message rendering, API calls, token refresh, and Socket.io real-time events.

## Tech Stack

- React 19
- Vite 8
- React Router DOM 7
- Axios
- Socket.io Client
- React Hook Form
- Redux Toolkit / React Redux
- Tailwind CSS 4
- ESLint

## Features

- Signup and login pages
- Protected chat route
- Access token storage in `localStorage`
- Cookie-based refresh-token flow through the API
- Axios request interceptor for bearer tokens
- Axios response interceptor for automatic token refresh on `401`
- Socket.io connection after authentication
- Chat, auth, and socket context providers
- One-to-one chat API integration
- User search API integration
- Paginated message API integration

## Project Structure

```text
client/
├── src/
│   ├── api/                 # Axios instance and API wrappers
│   ├── assets/              # Static image assets
│   ├── components/          # Reusable UI components
│   ├── context/             # Auth, chat, and socket providers
│   ├── hooks/               # Client hooks
│   ├── pages/               # Route-level pages
│   ├── App.jsx              # Application routes/providers
│   ├── App.css              # App-level styles
│   ├── index.css            # Global styles
│   └── main.jsx             # React entry point
├── public/                  # Public static files
├── package.json             # Scripts and dependencies
├── vite.config.js           # Vite + React + Tailwind config
└── README.md
```

Note: there are also legacy/top-level folders such as `client/api`, `client/context`, `client/hooks`, `client/socket`, and `client/utils`. The active Vite app imports from `client/src/...`.

## Prerequisites

- Node.js 20+ recommended
- npm
- Running backend API server
- MongoDB configured on the server

## Environment Variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

If the server uses a different `PORT`, update both values to match.

## Installation

```bash
cd client
npm install
```

## Development

Start the Vite dev server:

```bash
npm run dev
```

Default Vite URL:

```text
http://localhost:5173
```

The backend `CLIENT_URL` must match this URL for CORS and cookies:

```env
CLIENT_URL=http://localhost:5173
```

For Vercel production, set these environment variables in the Vercel dashboard:

```env
VITE_API_URL=https://YOUR_RENDER_PUBLIC_URL.onrender.com/api/v1
VITE_SOCKET_URL=https://YOUR_RENDER_PUBLIC_URL.onrender.com
```

The Render service ID, for example `srv-d8a39t7avr4c73d4ji50`, is not the public browser URL. Use the public `https://...onrender.com` URL shown in the Render service dashboard.

The active frontend reads these values from `src/config/env.js`. Local development reads `client/.env`, and production reads the Vercel environment variables.

Do not set Vercel env values to `http://localhost:5001`. A deployed browser cannot reach your local backend. The build includes `scripts/check-env.mjs`, which fails Vercel builds if `VITE_API_URL` or `VITE_SOCKET_URL` points to localhost.

## Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Linting

```bash
npm run lint
```

## Routing

| Path      | Component        | Access                       |
| --------- | ---------------- | ---------------------------- |
| `/login`  | `LoginPage`      | Public                       |
| `/signup` | `SignupPage`     | Public                       |
| `/`       | `ChatPage`       | Protected                    |
| `*`       | Redirects to `/` | Protected by redirect target |

## API Client

The active Axios instance is defined in:

```text
src/api/axios.config.js
```

Behavior:

- `baseURL` comes from `VITE_API_URL`
- `withCredentials: true` sends refresh-token cookies
- access token is read from `localStorage`
- `401` responses trigger `/auth/refresh-token`
- failed refresh removes the stored access token

API wrapper files:

- `src/api/auth.api.js`
- `src/api/chat.api.js`
- `src/api/message.api.js`

## Socket.io Client

The active socket provider is:

```text
src/context/SocketContext.jsx
```

It connects only after a user is authenticated and sends the access token through Socket.io auth:

```js
auth: { token: localStorage.getItem('accessToken') }
```

Expected server URL:

```env
VITE_SOCKET_URL=https://YOUR_RENDER_PUBLIC_URL.onrender.com
```

## Common Problems

### API requests go to the wrong port

Check `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

Then restart Vite. Vite only loads env values when the dev server starts.

### Login/signup returns CORS or cookie errors

Check the backend:

```env
CLIENT_URL=https://whats-app-clone-client-liart.vercel.app
```

Also confirm the frontend uses `withCredentials: true`, which is already configured in `src/api/axios.config.js`.

### Socket connection fails

Check:

- `VITE_SOCKET_URL` points to the backend root URL, not `/api/v1`
- the user has a valid access token in `localStorage`
- backend `JWT_SECRET` matches the token signing secret

## Git and GitHub Workflow

Recommended branch naming:

```text
feature/client-chat-ui
fix/client-auth-refresh
chore/client-deps
```

Recommended commit style:

```text
feat(client): add protected chat route
fix(client): refresh access token on 401
docs(client): document environment setup
```

Before opening a pull request:

```bash
npm run lint
npm run build
```

Pull request checklist:

- UI route works in the browser
- API URL and socket URL are documented
- no secrets committed in `.env`
- screenshots included for visible UI changes
- backend compatibility noted when API contracts change
