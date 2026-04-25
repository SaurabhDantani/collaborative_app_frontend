# Collaborative App Frontend

A React + TypeScript frontend for a real-time collaboration tool. It connects to a Socket.IO backend, lets users create or join sessions, and provides a shared editor, live chat, presence list, and activity feed.

## Features

- Session creation and join UI
- Real-time chat messaging
- Live shared editor collaboration
- Active users presence list
- Activity feed for session events

## Tech Stack

- React.js
- TypeScript
- Socket.IO client
- Next.js
- CSS modules / global styling
- AWS EC2 backend integration

## Project Structure

- `src/` - main application source files
- `src/components/` - UI components for chat, editor, sidebar, and session views
- `src/app/` - Next.js page routing and layout
- `src/services/` - API and socket connection helpers
- `src/context/` - shared state providers for authentication and sockets
- `src/components/chat/` - chat UI, session panel, and sidebar components
- `src/components/ui/` - reusable UI elements

## How It Works ⭐

The frontend connects to the backend using REST for session lifecycle operations and Socket.IO for real-time events.

- `create` and `join` session actions use REST endpoints to create or retrieve session metadata.
- The Socket.IO client joins session-specific rooms and listens for updates.
- Real-time state is managed through React context and component state, keeping chat, editor, presence, and activity feed synchronized.

## Setup Instructions

1. Clone the repository:

```bash
git clone <repo-url>
cd collaborative_app_frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the application locally:

```bash
npm run dev
```

## Environment Variables

Configure the backend URL for the client connection:

```env
NEXT_PUBLIC_API_URL=http://your-ec2-ip
```

If you use a custom socket URL or additional environment values, add them to `.env.local`.

## Deployment

This frontend can deploy to Vercel, Netlify, or a static hosting environment. It connects to the backend through the configured API URL.

- Vercel / Netlify: deploy the Next.js app and set `NEXT_PUBLIC_API_URL` to your EC2 backend.
- EC2: host the built frontend behind Nginx or a similar reverse proxy and point the UI to the backend endpoint.

## UI Overview

- Join page: lets users create or join a session with a session name or ID.
- Collaboration room: displays the shared editor, chat panel, active users list, and activity feed.

## Challenges & Solutions ⭐

- Handling real-time updates: the Socket.IO client listens for session events and updates React state immediately.
- Preventing excessive socket calls: emit editor updates in a controlled flow and rely on client-side state to reduce duplicate events.

## Limitations

- Basic UI design focused on functionality over polish.
- Editor sync is simplified and uses a last-write-wins approach from the backend.

## Future Improvements

- Enhance UI/UX with richer styling and responsive design.
- Replace the simple editor with a rich text or code editor.
- Add authentication and authorization for session access.
- Improve reconnect handling and session recovery.

## Notes

This frontend is designed to demonstrate real-time collaboration behavior, integrate with a Socket.IO backend, and showcase the architecture of a live collaboration application.
