# SharePlate

Real-time surplus food redistribution app for hackathons and portfolio demos.

## What Is Built

- Home page with project context and feature overview
- Donor page to post food batches instantly
- Responder page with first-come claim locking
- Auto-prioritization of soonest-expiring donations
- Live countdown timers and visual urgency indicators
- Midnight Shadows premium interface with 3D-style animated background

## Stack Used (Local Friendly)

- Frontend: React + Vite + Tailwind CSS
- Realtime: Socket.IO
- Backend: Node.js + Express
- Data store: In-memory map (zero setup for demo/hackathon)

## Run Locally

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Install backend dependencies:

   ```bash
   npm --prefix server install
   ```

3. Start frontend + backend together:

   ```bash
   npm run dev:full
   ```

4. Open:
   - Frontend: http://localhost:5173
   - Backend health: http://localhost:4001/health

App routes:
- `/` home
- `/donor` donor portal
- `/responder` NGO responder feed

## Optional Environment Override

Create a `.env` file in the project root if you want a custom backend URL:

```bash
VITE_SERVER_URL=http://localhost:4001
```

## API & Events

- `POST /donations`: create donation
- `GET /donations`: list active donations
- Socket events:
  - `JOIN_NGO_ROOM`
  - `INITIAL_DONATIONS`
  - `NEW_DONATION`
  - `CLAIM_DONATION`
  - `BATCH_CLAIMED`
  - `BATCH_EXPIRED`
