# YourTube

A YouTube-style video platform built as a two-part app:

- **`server/`** — Express + MongoDB (Mongoose) REST API. Handles auth (via Firebase-issued profile data), video upload/storage, likes, dislikes, comments, watch history, and watch-later.
- **`yourtube/`** — Next.js (Pages Router) + TypeScript + Tailwind frontend. Google sign-in via Firebase Auth, video upload/playback, channels, search, likes/dislikes, comments, history, and watch-later.

## What changed in this pass

This codebase was reviewed end-to-end and the following real bugs were fixed:

**Backend**
- Added the missing `GET /video/:id` endpoint — the frontend's watch page called this but it didn't exist, so **every video page showed "Video not found."**
- Added `GET /video/search` and wired the search page to it (it was previously showing hardcoded mock results).
- Added `GET /user/:id` and `GET /video/channel/:uploaderId` so channel pages show the actual channel being visited instead of always showing your own profile.
- Fixed `Modals/video.js` — a duplicate `filename` schema key silently overwrote itself.
- Fixed `handleview` in `controllers/history.js` — it never sent a response, so that request would hang indefinitely on the client.
- Fixed video uploads failing with `ENOENT` — the `uploads/` folder didn't exist and multer doesn't create it. The server now creates it automatically and resolves an absolute path instead of a fragile relative one.
- Connection ordering: the server now connects to MongoDB *before* it starts listening, and exits cleanly with a clear error if `DB_URL` is missing or unreachable.
- Added a 404 handler, a centralized error handler, and configurable CORS via `FRONTEND_URL`.
- Removed unused dependencies (`fs`, `body-parser`, `express-fileupload`).

**Frontend**
- Fixed five case-sensitive import mismatches (e.g. importing `VideoGrid` from a file actually named `Videogrid.tsx`). **This is almost certainly why the app failed to build on Vercel** — case mismatches are silently tolerated on Windows/Mac but fail the build on Linux, which is what Vercel (and most hosts) run.
- Fixed `pages/explore/explore.js`, which actually routed to `/explore/explore` instead of `/explore` (the route the sidebar links to).
- Fixed a crash in `ChannelHeader.tsx` when viewing a channel for a user who hasn't set a channel name yet.
- Rewrote the channel page to fetch the real channel + real videos instead of always displaying the logged-in user's data with hardcoded sample videos.
- Moved the Firebase client config out of source and into environment variables.
- Removed a stray `console.log`, an unused Next.js API boilerplate route, and a 900KB unused placeholder video asset.

**Security — please do this regardless of anything else in this repo:**
`server/.env` (containing a real MongoDB Atlas password) was committed to git history and only deleted afterward — deletion doesn't remove it from history. **Rotate that MongoDB Atlas database user's password now** if you haven't already, from the Atlas dashboard (Database Access → edit user → Edit Password). The git history in this delivered copy has been reset to a single clean commit so the secret isn't sitting in history going forward, but the original repo/host it came from may still have it.

## Local setup

### 1. Backend

```bash
cd server
cp .env.example .env   # then fill in DB_URL with your MongoDB connection string
npm install
npm run dev             # nodemon, http://localhost:5000
```

### 2. Frontend

```bash
cd yourtube
cp .env.example .env.local   # then fill in your Firebase config + backend URL
npm install
npm run dev              # http://localhost:3000
```

The frontend expects the backend at `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:5000` for local dev).

## Deployment

### Backend (`server/`) — Render, Railway, or similar (needs persistent-ish process + disk)

This backend stores uploaded video files **on local disk** (`server/uploads/`) and serves them via `/uploads`. That works on a normal VM/container host (Render, Railway, a VPS) but **will not work on serverless platforms** (Vercel, AWS Lambda, Netlify Functions) because their filesystems are ephemeral — uploaded files would disappear on the next deploy or cold start.

1. Push `server/` to its own Render/Railway service (root directory: `server`).
2. Build command: `npm install`. Start command: `npm start`.
3. Set environment variables: `DB_URL` (MongoDB Atlas connection string), `PORT` (usually provided automatically by the platform), `FRONTEND_URL` (your deployed frontend origin, e.g. `https://yourtube.vercel.app`).
4. **Recommended next step, not done here**: for a production deployment you'll eventually want video storage on something like Cloudinary, S3, or a similar object store instead of local disk — most hosts either wipe local disk on redeploy or don't persist it across instances at all. The current setup will work for a single always-on instance with persistent disk (e.g. Render's paid persistent disk add-on), but will silently lose uploaded videos on platforms with ephemeral storage.

### Frontend (`yourtube/`) — Vercel

1. Import the repo into Vercel, set the project root to `yourtube`.
2. Set environment variables in the Vercel dashboard: `NEXT_PUBLIC_BACKEND_URL` (your deployed backend URL) and the six `NEXT_PUBLIC_FIREBASE_*` variables from `.env.example`.
3. Deploy — Next.js needs no extra config here.

### MongoDB

Use MongoDB Atlas (already the case here) and make sure the Atlas cluster's Network Access allows connections from your backend host (or `0.0.0.0/0` if the host uses dynamic IPs, common on Render's free tier).

## Known limitations (not fixed in this pass, flagged for visibility)

- No JWT/session-based auth — the backend trusts whatever `email`/`name` the frontend sends to `/user/login` after a client-side Firebase sign-in, with no server-side verification of the Firebase ID token. Fine for a class project or portfolio demo; for anything with real users, verify the Firebase ID token server-side (via `firebase-admin`) before trusting the identity in each request.
- Local disk video storage, discussed above under Deployment.
- Watch history "remove" and subscriptions are UI-only / not backed by an API endpoint yet.
