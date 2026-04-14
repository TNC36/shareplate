import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, HandHeart, MapPin, Siren } from "lucide-react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { socket } from "../lib/realtime";

const MotionDiv = motion.div;

function formatTimer(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parseLatLng(locationText) {
  const parts = String(locationText).split(",").map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }
  const [lat, lng] = parts;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return [lat, lng];
}

function ResponderPage() {
  const [donations, setDonations] = useState([]);
  const [ngoName, setNgoName] = useState("Hope Kitchen");
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [acceptedDonation, setAcceptedDonation] = useState(null);
  const [claimCode, setClaimCode] = useState("");

  useEffect(() => {
    socket.connect();
    socket.emit("JOIN_NGO_ROOM");

    const onInitial = (items) => setDonations(items);
    const onNew = (item) => {
      setDonations((prev) => [item, ...prev]);
      setToast("New batch posted.");
    };
    const onClaimed = ({ donationId, claimedBy }) => {
      setDonations((prev) => prev.filter((item) => item.id !== donationId));
      setToast(`Claimed by ${claimedBy}`);
    };
    const onClaimResult = ({ ok, donation, claimCode: nextCode }) => {
      if (!ok) {
        return;
      }
      if (donation) {
        setAcceptedDonation(donation);
        setToast(`Pickup map unlocked for ${donation.foodType}`);
      }
      if (nextCode) {
        setClaimCode(nextCode);
      }
    };
    const onExpired = ({ id }) => {
      setDonations((prev) => prev.filter((item) => item.id !== id));
    };

    socket.on("INITIAL_DONATIONS", onInitial);
    socket.on("NEW_DONATION", onNew);
    socket.on("BATCH_CLAIMED", onClaimed);
    socket.on("BATCH_EXPIRED", onExpired);
    socket.on("CLAIM_RESULT", onClaimResult);

    return () => {
      socket.off("INITIAL_DONATIONS", onInitial);
      socket.off("NEW_DONATION", onNew);
      socket.off("BATCH_CLAIMED", onClaimed);
      socket.off("BATCH_EXPIRED", onExpired);
      socket.off("CLAIM_RESULT", onClaimResult);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const clear = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(clear);
  }, [toast]);

  const liveFeed = useMemo(
    () =>
      donations
        .map((item) => ({
          ...item,
          timeLeftMs: Math.max(0, new Date(item.expiryTime).getTime() - now),
        }))
        .filter((item) => item.timeLeftMs > 0)
        .sort((a, b) => a.timeLeftMs - b.timeLeftMs),
    [donations, now],
  );

  const urgentCount = liveFeed.filter((item) => item.timeLeftMs < 8 * 60 * 1000).length;
  const acceptedPosition = acceptedDonation ? parseLatLng(acceptedDonation.donorLocation) : null;

  function claimDonation(donationId) {
    socket.emit("CLAIM_DONATION", { donationId, ngoName });
  }

  function copyClaimCode() {
    if (!claimCode) {
      return;
    }
    navigator.clipboard.writeText(claimCode);
    setToast("Claim code copied.");
  }

  function openMaps() {
    if (!acceptedDonation) {
      return;
    }
    const target = acceptedPosition
      ? `https://www.google.com/maps?q=${acceptedPosition[0]},${acceptedPosition[1]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acceptedDonation.donorLocation)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <p className="label">Live Batches</p>
          <p className="mt-1 text-3xl font-semibold text-white">{liveFeed.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="label">Urgent Queue</p>
          <p className="mt-1 text-3xl font-semibold text-rose-200">{urgentCount}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="label">Responder Identity</p>
          <input
            className="field mt-2"
            value={ngoName}
            onChange={(e) => setNgoName(e.target.value)}
            placeholder="NGO name"
          />
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-6 md:p-8">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">Responder Feed</h1>
        <p className="mt-2 text-slate-300">
          Live first-response stream. Fast claims lock the batch globally.
        </p>

        <div className="mt-6 grid gap-4">
          {liveFeed.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/20 p-7 text-center text-slate-400">
              No active batches right now.
            </p>
          )}
          {liveFeed.map((item) => {
            const urgent = item.timeLeftMs < 8 * 60 * 1000;
            return (
              <MotionDiv
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 md:p-5 ${
                  urgent
                    ? "border-rose-200/60 bg-rose-500/15"
                    : "border-blue-200/40 bg-blue-500/10"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-xl font-semibold text-white">{item.foodType}</p>
                    <p className="mt-1 text-slate-300">{item.quantity}</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-300">
                      <MapPin size={14} /> {item.donorLocation}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs text-slate-100">
                      <Clock3 size={13} /> {formatTimer(item.timeLeftMs)}
                    </span>
                    {urgent && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/40 bg-rose-500/20 px-3 py-1 text-xs text-rose-100">
                        <Siren size={13} /> Expiring soon
                      </span>
                    )}
                  </div>
                </div>
                <button className="btn-primary mt-4" type="button" onClick={() => claimDonation(item.id)}>
                  <HandHeart size={15} />
                  Claim Batch
                </button>
              </MotionDiv>
            );
          })}
        </div>
      </section>

      {acceptedDonation && (
        <section className="glass-panel mt-5 rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Accepted Pickup Location</h2>
          {claimCode && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#f6e7b0]">
                Claim code: <span className="font-semibold tracking-wider">{claimCode}</span>
              </p>
              <button className="btn-primary !py-2 text-xs" type="button" onClick={copyClaimCode}>
                Copy Code
              </button>
              <button className="btn-primary !py-2 text-xs" type="button" onClick={openMaps}>
                Open in Google Maps
              </button>
            </div>
          )}
          <p className="mt-2 text-slate-300">
            Batch: <span className="text-[#f1e1ad]">{acceptedDonation.foodType}</span> -{" "}
            {acceptedDonation.quantity}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Donor location: {acceptedDonation.donorLocation}
          </p>
          {acceptedPosition ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#D4AF37]/35">
              <MapContainer center={acceptedPosition} className="h-72 w-full" scrollWheelZoom zoom={14}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={acceptedPosition} />
              </MapContainer>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-sm text-[#f6e7b0]">
              Exact coordinates not available. Ask donor to provide map coordinates (lat, lng).
            </p>
          )}
        </section>
      )}

      {toast && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-rose-200/40 bg-rose-500/20 px-4 py-2 text-sm text-rose-100 backdrop-blur-xl"
        >
          {toast}
        </MotionDiv>
      )}
    </div>
  );
}

export default ResponderPage;
