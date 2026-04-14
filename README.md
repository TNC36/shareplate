# SharePlate 🍲

**Real-time surplus food redistribution app for hackathons and portfolio demos.**

SharePlate is a high-velocity logistics tool designed to bridge the gap between food donors and responders. Built with a focus on "visual urgency" and real-time synchronization, it ensures surplus food is claimed and moved before it expires.

🔗 **Live Demo:** [View SharePlate on Vercel](https://shareplate-54w6stav4-tnc36s-projects.vercel.app/)

---

## 🚀 Key Features

* **Midnight Shadows UI:** A premium "Dark Luxury" interface featuring a 3D-style animated background for a professional demo-ready look.
* **Real-Time Claim Locking:** Synchronized first-come, first-served claim system powered by WebSockets to prevent double-claiming.
* **Expiration Intelligence:** Logic that automatically pushes soonest-expiring donations to the top of the feed.
* **Visual Urgency:** Live countdown timers and dynamic UI indicators that shift state as food nears its expiry.
* **Dual-Portal System:** Dedicated interfaces for Donors (to post batches) and Responders (to monitor the live feed).

## 🛠️ Tech Stack

Designed to be **"Local Friendly"** with zero database configuration required for immediate deployment:

* **Frontend:** React (Vite) + Tailwind CSS
* **Real-time:** Socket.io
* **Backend:** Node.js + Express
* **Data Store:** In-memory Map (Zero-setup; ideal for ephemeral hackathon environments)

---

## 💻 Getting Started

### 1. Installation
Install dependencies for both the frontend and the backend server:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm --prefix server install
```

### 2. Run the Application
Start both the React development server and the Node.js backend simultaneously:

```bash
npm run dev:full
```

### 3. Access Portals
* **Frontend:** `http://localhost:5173`
* **Backend Health:** `http://localhost:4001/health`

**Available Routes:**
* `/` — Landing Page & Overview
* `/donor` — Donor Portal (Post new batches)
* `/responder` — NGO Responder Feed (Claim live batches)

---

## ⚙️ Configuration

To use a custom backend URL, create a `.env` file in the project root:

```env
VITE_SERVER_URL=http://localhost:4001
```

---

## 📡 API & Socket Architecture

### REST Endpoints
* `POST /donations`: Create a new food donation.
* `GET /donations`: List all active, unexpired donations.

### Socket.io Events
| Event | Action |
| :--- | :--- |
| `JOIN_NGO_ROOM` | Joins the real-time update stream for responders. |
| `INITIAL_DONATIONS` | Syncs current active batches upon connection. |
| `NEW_DONATION` | Broadcasts a new batch to all active responders. |
| `CLAIM_DONATION` | Initiates a claim lock on a specific batch. |
| `BATCH_CLAIMED` | Global notification that a batch has been successfully claimed. |
| `BATCH_EXPIRED` | Automatic removal of a batch from all UI instances upon expiry. |
