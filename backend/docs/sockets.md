# Socket.IO — Real-Time Communication

Thread Trade uses Socket.IO alongside the Express HTTP server to provide real-time chat and live typing indicators between swap partners.

---

## Architecture

The Socket.IO server is initialized in `src/sockets/` and attached to the same Node.js `http.Server` instance as Express:

```js
// server.js (root)
import { createServer } from 'http';
import app from './src/app.js';
import { initSocket } from './src/sockets/index.js';

const httpServer = createServer(app);
initSocket(httpServer);
httpServer.listen(PORT);
```

This means both HTTP (REST API) and WebSocket traffic are served from the same port.

---

## Authentication

Socket connections are authenticated using the same JWT access token as REST requests. The token is passed as a query parameter during the handshake:

```js
// Client-side
const socket = io(SOCKET_URL, {
  auth: { token: accessToken }
});
```

On the server, a middleware verifies the token before allowing the connection to proceed. Unauthenticated connections are rejected with a `401` error.

---

## Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `chat:join` | `swapRequestId` | Joins the Socket.IO room for a specific swap thread |
| `chat:message` | `{ swapRequestId, text }` | Sends a new message; persisted to MongoDB via `Message` model |
| `chat:typing` | `{ swapRequestId, isTyping }` | Broadcasts typing status to the other participant |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `chat:message` | Full `Message` document | Broadcasts a new message to all room members |
| `chat:typing` | `{ userId, isTyping }` | Relays typing status to the other participant |
| `notification` | Notification object | Pushes a new in-app notification to the recipient |

---

## Rooms

Each swap request has its own Socket.IO room, keyed by `swapRequestId`. When a user opens the chat page, the frontend emits `chat:join` to subscribe to that room. Only the two swap participants are authorized to join their respective room.

---

## Message Persistence

When the server receives a `chat:message` event, it:
1. Saves a new `Message` document to MongoDB (with `swapRequest`, `sender`, and `text` fields).
2. Broadcasts the saved document (with populated `sender`) back to all members of the room via `chat:message`.

This ensures both real-time delivery and persistent history (fetched via the REST `GET /api/chat/:swapId/messages` endpoint on page load).
