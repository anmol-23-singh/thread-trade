# Thread Trade — Clothing Exchange & Swap Marketplace

A full-stack barter-first platform where users swap clothes directly instead of buying/selling.
Built to the Clothing Exchange & Swap Marketplace PRD (Unified Mentor), Phase 1 scope, plus a
set of commonly-expected extras (wishlist, reviews, notifications, reports, audit logs).

## Architecture

```
thread-trade/
├── backend/                 Node.js + Express + Mongoose API
│   ├── server.js             entrypoint: HTTP server + Socket.IO attach
│   ├── src/
│   │   ├── app.js            Express app: middleware + route mounting
│   │   ├── config/           db.js, logger.js, cloudinary.js
│   │   ├── models/           Mongoose schemas (User, Listing, SwapRequest, Message, Review, Report, Notification, AuditLog)
│   │   ├── middleware/       auth.js (JWT + roles), validate.js (Zod), errorHandler.js
│   │   ├── controllers/      business logic per module
│   │   ├── routes/           Express routers per module
│   │   ├── sockets/          Socket.IO gateway (real-time chat)
│   │   └── utils/            token generation, email stub, validators, audit logger, seed script
│   └── .env.example
├── frontend/                 React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── api/               axios instance (auto token refresh) + service functions
│       ├── context/           AuthContext (session state)
│       ├── hooks/              useSocket (Socket.IO client)
│       ├── routes/            ProtectedRoute / AdminRoute guards
│       ├── components/        Navbar, ListingCard
│       └── pages/              Login, Register, Listings, ItemDetail, SwapRequestPage, Dashboard, Chat, Admin
├── docker-compose.yml
└── README.md (this file)
```

## Module ↔ file map (matches the PRD)

| PRD Module | Backend files | Frontend page |
|---|---|---|
| User Module | `models/User.js`, `controllers/authController.js`, `controllers/userController.js`, `routes/authRoutes.js`, `routes/userRoutes.js` | `Login.jsx`, `Register.jsx`, `Dashboard.jsx` |
| Clothing Listing Module | `models/Listing.js`, `controllers/listingController.js`, `routes/listingRoutes.js` | `Listings.jsx`, `ItemDetail.jsx`, `Dashboard.jsx` (new listing form) |
| Swap Request Module | `models/SwapRequest.js`, `controllers/swapController.js`, `routes/swapRoutes.js` | `SwapRequestPage.jsx`, `Dashboard.jsx` (incoming/outgoing) |
| Negotiation Chat Module | `models/Message.js`, `sockets/chatSocket.js`, `controllers/chatController.js` | `Chat.jsx` |
| Swap Value Calculator | fairness logic inside `swapController.js` (`isFairMatch`) | live preview in `SwapRequestPage.jsx` |
| Location-Based Matching | geospatial `2dsphere` index on `Listing.location`, `getNearbyListings` | filters in `Listings.jsx` |
| Admin Module | `controllers/adminController.js`, `routes/adminRoutes.js` | `Admin.jsx` |
| **Extras**: Wishlist | `User.wishlist`, `userController.toggleWishlist` | wishlist button in `ItemDetail.jsx` |
| **Extras**: Reviews/ratings | `models/Review.js`, `controllers/reviewController.js` | review prompt in `Chat.jsx` |
| **Extras**: Reports/block | `models/Report.js`, `controllers/reportController.js`, admin block endpoint | admin `Reports` tab |
| **Extras**: Notifications | `models/Notification.js`, emitted over Socket.IO on swap events | (wire a bell icon to `notificationApi` to surface these) |
| **Extras**: Audit logs | `models/AuditLog.js`, `utils/audit.js`, called from admin actions | admin `getAuditLogs` endpoint (not yet in UI — quick add) |

## Auth model

- **Access token**: short-lived JWT (15 min), kept only in React memory (never localStorage) — sent as `Authorization: Bearer <token>`.
- **Refresh token**: long-lived JWT (30 days), stored in an `httpOnly`, `sameSite=strict` cookie scoped to `/api/auth` — invisible to JS, rotated on every refresh.
- **Roles**: `user` / `admin`, enforced by `authorize('admin')` middleware on every admin route.
- The frontend axios instance automatically calls `/api/auth/refresh` on a 401 and retries the original request — this is what keeps you logged in across page reloads.

## What's stubbed vs. fully wired

Fully wired: registration/login/JWT refresh, listing CRUD + image upload to Cloudinary, swap request lifecycle (pending → accepted/rejected → completed), real-time chat via Socket.IO with typing + seen status, value-fairness calculator, geospatial nearby search, wishlist, reviews/ratings, admin dashboard (stats, users, listings, reports), rate limiting, input validation (Zod), centralized error handling, audit logging.

Stubbed (clearly marked in code, safe no-ops until you configure a provider):
- **Email sending** (`backend/src/utils/email.js`) — logs to console instead of sending. Swap in Nodemailer/SendGrid/Resend when ready; every call site already awaits it, so no other file changes.
- **Cloudinary** — works once you add real credentials to `.env`; without them, image upload will fail (listings still work without photos).
- **Dark mode** — not implemented; Tailwind is configured so it's a `darkMode: 'class'` + a few `dark:` classes away.

---

## Running it locally — step by step

### 1. Prerequisites
- Node.js 20+ and npm
- A MongoDB database — easiest is a free **MongoDB Atlas** cluster (cloud.mongodb.com), or run MongoDB locally/in Docker.
- (Optional, for photo uploads) a free **Cloudinary** account.

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Open `.env` and fill in:
- `MONGO_URI` — from MongoDB Atlas: Database → Connect → Drivers → copy the connection string, replace `<username>`/`<password>`.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — any long random strings (e.g. run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` twice).
- Cloudinary keys — optional for first run.

Seed the database with demo users and listings:
```bash
npm run seed
```
Start the API:
```bash
npm run dev
```
You should see `Thread Trade API running on port 5000` and `MongoDB connected: ...`.
Sanity check: open `http://localhost:5000/api/health` in a browser — should return `{"success":true,"status":"ok",...}`.

### 3. Frontend setup
Open a **second terminal**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the printed URL (usually `http://localhost:5173`).

Log in with a seeded demo account:
- `ananya@example.com` / `Password123`
- `devika@example.com` / `Password123`
- `rohit@example.com` / `Password123`
- `admin@example.com` / `Password123` (role: admin — unlocks the Admin panel)

### 4. Try the full flow
1. Log in as **devika** → go to Browse → open Rohit's "Formal Oxford Shirt" → Propose a swap.
2. You'll need something to offer — log in as **ananya** or **rohit** first and list an item if you haven't, or just use a seeded item you already own.
3. Send the swap request, watch the fairness calculator.
4. Log in as the item owner in another browser (or incognito window) → Dashboard → Incoming Requests → Accept.
5. Open the chat thread — messages arrive in real time via Socket.IO.
6. Mark the swap complete → leave a review.
7. Log in as **admin** → Admin panel → see the swap reflected in the stats, moderate listings/users.

### 5. Running with Docker instead (optional)
```bash
docker compose up --build
```
This builds and runs backend, frontend, and a local MongoDB together. Update `backend/.env`'s `MONGO_URI` to `mongodb://mongo:27017/threadtrade` first.

---

## Deploying for real (getting your actual submission links)

1. **GitHub repo**: `git init && git add . && git commit -m "Thread Trade v1"`, create a repo on github.com, `git remote add origin <url> && git push -u origin main`. Push `backend/` and `frontend/` together as one repo (or split into two repos — either is fine, just be consistent in your report).
2. **Database**: create a free MongoDB Atlas cluster, add your deployment's IP (or `0.0.0.0/0` for simplicity) to the network access list, copy the connection string into your host's environment variables.
3. **Backend deploy (Render)**: New → Web Service → connect your repo → root directory `backend` → build command `npm install` → start command `node server.js` → add all `.env` variables in Render's dashboard (including `CLIENT_URL` set to your deployed frontend URL once you have it).
4. **Frontend deploy (Vercel)**: New Project → import repo → root directory `frontend` → framework preset "Vite" → add env var `VITE_API_URL=https://<your-render-app>.onrender.com/api` and `VITE_SOCKET_URL=https://<your-render-app>.onrender.com`.
5. Once both are live, update the backend's `CLIENT_URL` env var to your Vercel URL and redeploy the backend (needed for CORS + cookies to work cross-origin).
6. **Project report**: I can generate this as a Word/PDF doc from this README + your PRD on request.
7. **Feedback video**: record yourself using the deployed link, upload to YouTube (unlisted) or Drive, share that link.

## Known limitations to mention in your report
- Email verification/reset links are logged to the server console rather than actually emailed (swap in a real provider for production).
- No automated test suite yet (add Jest/Supertest for the backend, Vitest/RTL for the frontend as a next step).
- Notification bell UI and audit-log UI are backed by working APIs but not yet wired into a visible frontend component — everything else in the PRD's Phase 1 scope is live end-to-end.
