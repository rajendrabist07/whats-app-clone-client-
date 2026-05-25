# WhatsApp MERN Client

React + Vite frontend for a real-time WhatsApp-style MERN chat application. This client handles signup, login, protected chat access, user search, one-to-one chat creation, message loading, message sending, access-token storage, refresh-token retry, and Socket.io live updates.

## Live Project URLs

| Service          | URL                                                       |
| ---------------- | --------------------------------------------------------- |
| Frontend, Vercel | `https://whats-app-clone-client-liart.vercel.app`         |
| Backend, Render  | `https://whats-app-clone-server-ksph.onrender.com`        |
| Backend API Base | `https://whats-app-clone-server-ksph.onrender.com/api/v1` |

## What This Client Does

- User signup and login
- Protected chat dashboard
- Current user session restore from access token
- Automatic access-token refresh on `401`
- Search other users by username or email
- Start or reopen one-to-one chats
- Load recent chats
- Load paginated messages for selected chat
- Send text messages
- Receive real-time messages through Socket.io
- Show socket online/offline connection state
- Logout and clear local session

## Tech Stack

| Area       | Technology                                             |
| ---------- | ------------------------------------------------------ |
| UI         | React 19                                               |
| Build Tool | Vite 8                                                 |
| Routing    | React Router DOM 7                                     |
| API Client | Axios                                                  |
| Real-time  | Socket.io Client                                       |
| Forms      | React Hook Form                                        |
| Styling    | Tailwind CSS + custom CSS                              |
| State      | React Context, local reducer, Redux Toolkit dependency |
| Date UI    | date-fns                                               |
| Linting    | ESLint                                                 |

## Project Structure

```text
client/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── scripts/
│   └── check-env.mjs
├── src/
│   ├── api/
│   │   ├── auth.api.js
│   │   ├── axios.config.js
│   │   ├── chat.api.js
│   │   └── message.api.js
│   ├── assets/
│   ├── components/
│   │   ├── auth/ProtectedRoute.jsx
│   │   └── chat/ChatWindow.jsx
│   ├── config/env.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── ChatPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

Note: there are some older top-level folders like `client/api`, `client/context`, `client/hooks`, `client/socket`, and `client/utils`. The active Vite app imports from `client/src/...`.

## Prerequisites

- Node.js 20+
- npm
- Running backend server from `../server`
- MongoDB configured in backend
- Browser with localStorage and cookies enabled

## Environment Setup

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

Important rules:

- `VITE_API_URL` must end with `/api/v1`.
- `VITE_SOCKET_URL` must be backend root URL only, without `/api/v1`.
- After changing `.env`, restart `npm run dev`.
- Do not use localhost URLs in Vercel production.

For deployed Vercel frontend:

```env
VITE_API_URL=https://whats-app-clone-server-ksph.onrender.com/api/v1
VITE_SOCKET_URL=https://whats-app-clone-server-ksph.onrender.com
```

The app reads these values from `src/config/env.js`. Production builds fail if `VITE_API_URL` points to localhost.

## Installation

From the project root:

```bash
cd client
npm install
```

## Run Locally

Start backend first:

```bash
cd ../server
npm install
npm run dev
```

Backend should run on:

```text
http://localhost:5001
```

Then start frontend:

```bash
cd ../client
npm run dev
```

Frontend should run on:

```text
https://whats-app-clone-client-liart.vercel.app
```

Backend `server/.env` must allow this frontend URL:

```env
CLIENT_URL=https://whats-app-clone-client-liart.vercel.app
```

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Checks production env and creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run lint
```

Runs ESLint.

## App Routes

| Path      | Component       | Access          |
| --------- | --------------- | --------------- |
| `/signup` | `SignupPage`    | Public          |
| `/login`  | `LoginPage`     | Public          |
| `/`       | `ChatPage`      | Protected       |
| `*`       | Redirect to `/` | Depends on auth |

Protected routing is handled by `src/components/auth/ProtectedRoute.jsx`.

## How Authentication Works

1. User signs up or logs in from the frontend.
2. Frontend calls backend:
   - `POST /auth/signup`
   - `POST /auth/login`
3. Backend returns `user` and `accessToken`.
4. Frontend stores `accessToken` in `localStorage`.
5. Backend also sets refresh-token cookies.
6. Axios adds `Authorization: Bearer <accessToken>` to protected requests.
7. If a request returns `401`, Axios calls `/auth/refresh-token`.
8. If refresh succeeds, the failed request is retried.
9. If refresh fails, token is removed and user must login again.

Main files:

- `src/context/AuthContext.jsx`
- `src/api/auth.api.js`
- `src/api/axios.config.js`

## How Two Users Connect and Chat

यो app मा two users जोडिने flow यस्तो छ:

1. User A creates an account from `/signup`.
2. User B creates another account from another browser, incognito window, or different device.
3. Both users login.
4. User A goes to the chat page `/`.
5. User A types User B's username or email in `Search users`.
6. Frontend calls:

```http
GET /api/v1/users/search?q=<search text>
```

7. User A clicks User B from the search result.
8. Frontend calls:

```http
POST /api/v1/chats
Content-Type: application/json

{
  "userId": "USER_B_ID"
}
```

9. Backend creates a one-to-one chat if it does not exist. If it already exists, backend returns the existing chat.
10. Frontend adds that chat to the recent chat list and sets it as the active chat.
11. When User A opens the chat, frontend loads messages:

```http
GET /api/v1/messages/:chatId?page=1&limit=30
```

12. User A types a message and clicks `Send`.
13. Frontend calls:

```http
POST /api/v1/messages/:chatId
Content-Type: application/json

{
  "content": "Hello"
}
```

14. Backend saves the message in MongoDB.
15. Backend emits `new_message` to the Socket.io chat room.
16. User B receives the message in real time if logged in and connected.

Relevant frontend files:

- `src/pages/ChatPage.jsx` handles user search, chat list, and active chat selection.
- `src/components/chat/ChatWindow.jsx` loads messages, joins the chat room, sends messages, and listens for `new_message`.
- `src/context/ChatContext.jsx` stores chats and active chat.
- `src/context/SocketContext.jsx` creates the authenticated Socket.io connection.

Relevant backend flow:

- `GET /users/search` searches users except the current user.
- `POST /chats` creates or reuses one-to-one chat.
- `GET /messages/:chatId` loads messages.
- `POST /messages/:chatId` saves message and emits Socket.io event.

## Best Way to Test Two Users Locally

Use two separate browser sessions so both users can have different `localStorage` and cookies:

| User   | Browser Session         |
| ------ | ----------------------- |
| User A | Normal Chrome window    |
| User B | Incognito Chrome window |

Steps:

1. Open `https://whats-app-clone-client-liart.vercel.app/signup` in normal Chrome.
2. Signup as User A.
3. Open `https://whats-app-clone-client-liart.vercel.app/signup` in incognito.
4. Signup as User B.
5. In User A window, search User B by username or email.
6. Click User B.
7. Send a message.
8. In User B window, the chat should appear after refresh or after User B searches/opens the same chat. Real-time incoming messages work once the socket is connected and the user has joined the chat room.

If one user cannot see messages, refresh that user's chat page and select the chat again.

## API Integration

Base URL comes from:

```js
VITE_API_URL;
```

Active Axios instance:

```text
src/api/axios.config.js
```

API wrappers:

| File                     | Purpose                             |
| ------------------------ | ----------------------------------- |
| `src/api/auth.api.js`    | signup, login, logout, current user |
| `src/api/chat.api.js`    | get chats, search users, start chat |
| `src/api/message.api.js` | get messages, send message          |

## Socket.io Integration

Socket URL comes from:

```js
VITE_SOCKET_URL;
```

The socket connects only after login:

```js
io(SOCKET_URL, {
  auth: { token: localStorage.getItem("accessToken") },
  withCredentials: true,
});
```

Current frontend uses these events:

| Event         | Direction        | Purpose                        |
| ------------- | ---------------- | ------------------------------ |
| `connect`     | server to client | mark socket as online          |
| `disconnect`  | server to client | mark socket as offline         |
| `join_chat`   | client to server | join selected chat room        |
| `new_message` | server to client | receive message in active chat |

Backend also supports extra events like typing, delivered, seen, online, and offline. The current frontend can be extended to display those.

## Data Flow Summary

```text
Signup/Login
  -> AuthContext stores user + accessToken
  -> SocketContext connects with token
  -> ChatPage loads chats
  -> User searches another user
  -> startChat(userId)
  -> ChatContext sets activeChat
  -> ChatWindow loads messages
  -> Send message
  -> Backend saves message
  -> Socket.io emits new_message
  -> Receiver UI updates in real time
```

## Deployment

### Vercel Frontend

Set environment variables in Vercel:

```env
VITE_API_URL=https://whats-app-clone-server-ksph.onrender.com/api/v1
VITE_SOCKET_URL=https://whats-app-clone-server-ksph.onrender.com
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

### Render Backend Requirement

In backend production environment, set:

```env
CLIENT_URL=https://whats-app-clone-client-liart.vercel.app
```

If backend CORS does not include the deployed frontend URL, login, refresh-token cookies, and API requests can fail.

## Common Problems and Fixes

### Frontend says API env is missing

Create `client/.env` and restart Vite:

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

### API requests fail with CORS

Check backend `server/.env`:

```env
CLIENT_URL=https://whats-app-clone-client-liart.vercel.app
```

For deployed frontend, use the exact Vercel URL.

### Socket shows Offline

Check:

- Backend server is running.
- `VITE_SOCKET_URL` points to backend root URL.
- User is logged in.
- `localStorage` has `accessToken`.
- Backend `JWT_SECRET` matches the token used during login.

### Chat does not appear for second user

Refresh the second user's page and check recent chats. The backend creates the chat for both participants, but the current UI loads the chat list on page load.

### Message sends but does not appear live

Check:

- Both users are logged in.
- Both frontend windows show `Online`.
- Both users selected/opened the chat.
- Backend Socket.io server is running.

### Vercel build fails because of localhost

Production env cannot use localhost. Set:

```env
VITE_API_URL=https://whats-app-clone-server-ksph.onrender.com/api/v1
VITE_SOCKET_URL=https://whats-app-clone-server-ksph.onrender.com
```

## Git and GitHub Workflow

Recommended branch names:

```text
feature/client-chat-ui
feature/socket-typing-indicator
fix/auth-refresh-token
fix/chat-search-empty-state
chore/client-deps
docs/client-readme
```

Recommended commit style:

```text
feat: add chat search UI
fix: retry requests after token refresh
docs: complete client README
chore: update client dependencies
```

Before pushing:

```bash
npm run lint
npm run build
```

Example GitHub flow:

```bash
git checkout -b docs/client-readme
git add client/README.md
git commit -m "docs: complete client README"
git push origin docs/client-readme
```

Then open a pull request on GitHub and describe:

- What changed
- How you tested it
- Any required environment variables

## Future Improvements

- Show unread counts in chat list
- Display typing indicators
- Display delivered and seen status
- Add image/media message UI
- Add group chat UI
- Auto-update recent chats when a new chat is created by another user
- Add message pagination/infinite scroll in the chat window
- Add better loading skeletons and error states

## Quick Start Summary

```bash
# Terminal 1
cd server
npm install
npm run dev

# Terminal 2
cd client
npm install
npm run dev
```

Open:

```text
https://whats-app-clone-client-liart.vercel.app
```

Create two users, search one user from the other account, click that user, and start chatting.
