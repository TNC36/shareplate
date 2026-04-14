const express = require("express");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4001;
const DONATION_LIFETIME_MINUTES = 45;

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const donations = new Map();

function serializeDonation(donation) {
  return {
    ...donation,
    timeLeftMs: Math.max(0, new Date(donation.expiryTime).getTime() - Date.now()),
  };
}

function activeDonations() {
  return Array.from(donations.values())
    .filter((item) => item.status === "available")
    .map(serializeDonation)
    .sort((a, b) => a.timeLeftMs - b.timeLeftMs);
}

function randomId() {
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

function generateClaimCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SP-";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function removeExpiredDonations() {
  const now = Date.now();
  for (const [id, donation] of donations.entries()) {
    if (new Date(donation.expiryTime).getTime() <= now && donation.status === "available") {
      donation.status = "expired";
      io.to("ngo-room").emit("BATCH_EXPIRED", { id });
    }
  }
}

setInterval(removeExpiredDonations, 1000);

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/donations", (_, res) => {
  res.json(activeDonations());
});

app.post("/donations", (req, res) => {
  const { foodType, quantity, donorLocation, minutesToExpire } = req.body;

  if (!foodType || !quantity || !donorLocation) {
    return res.status(400).json({ error: "foodType, quantity and donorLocation are required" });
  }

  const expiresIn = Number.isFinite(Number(minutesToExpire))
    ? Math.max(1, Number(minutesToExpire))
    : DONATION_LIFETIME_MINUTES;

  const donation = {
    id: randomId(),
    foodType: String(foodType).trim(),
    quantity: String(quantity).trim(),
    donorLocation: String(donorLocation).trim(),
    status: "available",
    createdAt: new Date().toISOString(),
    expiryTime: new Date(Date.now() + expiresIn * 60 * 1000).toISOString(),
    claimedBy: null,
    claimedAt: null,
    claimCode: null,
  };

  donations.set(donation.id, donation);
  io.to("ngo-room").emit("NEW_DONATION", serializeDonation(donation));

  return res.status(201).json(serializeDonation(donation));
});

app.get("/claims/:code", (req, res) => {
  const requestedCode = String(req.params.code || "").trim().toUpperCase();
  const claimedDonation = Array.from(donations.values()).find(
    (item) => item.claimCode && item.claimCode.toUpperCase() === requestedCode,
  );

  if (!claimedDonation) {
    return res.status(404).json({ error: "Claim code not found." });
  }

  return res.json(serializeDonation(claimedDonation));
});

io.on("connection", (socket) => {
  socket.on("JOIN_NGO_ROOM", () => {
    socket.join("ngo-room");
    socket.emit("INITIAL_DONATIONS", activeDonations());
  });

  socket.on("CLAIM_DONATION", ({ donationId, ngoName }) => {
    const donation = donations.get(donationId);
    if (!donation) {
      socket.emit("CLAIM_RESULT", { ok: false, reason: "not_found", donationId });
      return;
    }

    if (donation.status !== "available") {
      socket.emit("CLAIM_RESULT", { ok: false, reason: "already_claimed", donationId });
      return;
    }

    donation.status = "claimed";
    donation.claimedBy = ngoName || "Unknown NGO";
    donation.claimedAt = new Date().toISOString();
    donation.claimCode = donation.claimCode || generateClaimCode();

    io.to("ngo-room").emit("BATCH_CLAIMED", {
      donationId,
      claimedBy: donation.claimedBy,
      claimedAt: donation.claimedAt,
      claimCode: donation.claimCode,
    });

    io.emit("DONATION_UPDATED", serializeDonation(donation));
    socket.emit("CLAIM_RESULT", {
      ok: true,
      donationId,
      claimCode: donation.claimCode,
      donation: serializeDonation(donation),
    });
  });
});

server.listen(PORT, () => {
  console.log(`SharePlate backend running on http://localhost:${PORT}`);
});
