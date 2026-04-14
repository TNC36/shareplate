import { useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { SERVER_URL } from "../lib/realtime";

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

function ClaimLookupPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimData, setClaimData] = useState(null);

  async function lookupClaim(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setClaimData(null);

    try {
      const response = await fetch(`${SERVER_URL}/claims/${encodeURIComponent(code.trim())}`);
      if (!response.ok) {
        throw new Error("Claim code not found.");
      }
      const data = await response.json();
      setClaimData(data);
    } catch (lookupError) {
      setError(lookupError.message);
    } finally {
      setLoading(false);
    }
  }

  const claimPosition = claimData ? parseLatLng(claimData.donorLocation) : null;

  function copyClaimCode() {
    if (!claimData?.claimCode) {
      return;
    }
    navigator.clipboard.writeText(claimData.claimCode);
  }

  function openMaps() {
    if (!claimData) {
      return;
    }
    const target = claimPosition
      ? `https://www.google.com/maps?q=${claimPosition[0]},${claimPosition[1]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(claimData.donorLocation)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10">
      <section className="glass-panel rounded-3xl p-6 md:p-8">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">Claim Code Lookup</h1>
        <p className="mt-2 text-slate-300">
          Enter your unique claim code to open full food details and pickup map.
        </p>

        <form className="mt-5 flex flex-col gap-3 md:flex-row" onSubmit={lookupClaim}>
          <input
            className="field"
            placeholder="Example: SP-ABC123"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            required
          />
          <button className="btn-primary justify-center md:min-w-[180px]" disabled={loading} type="submit">
            {loading ? "Loading..." : "Open Claim"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200/35 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
            {error}
          </p>
        )}
      </section>

      {claimData && (
        <section className="glass-panel mt-5 rounded-3xl p-6 md:p-8">
          <p className="label">Claim Code</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-wider text-[#f1e1ad]">{claimData.claimCode}</p>
            <button className="btn-primary !py-2 text-xs" type="button" onClick={copyClaimCode}>
              Copy Code
            </button>
            <button className="btn-primary !py-2 text-xs" type="button" onClick={openMaps}>
              Open in Google Maps
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <p className="rounded-xl border border-[#D4AF37]/20 bg-black/20 px-4 py-3 text-slate-200">
              <span className="text-[#D4AF37]">Food:</span> {claimData.foodType}
            </p>
            <p className="rounded-xl border border-[#D4AF37]/20 bg-black/20 px-4 py-3 text-slate-200">
              <span className="text-[#D4AF37]">Quantity:</span> {claimData.quantity}
            </p>
            <p className="rounded-xl border border-[#D4AF37]/20 bg-black/20 px-4 py-3 text-slate-200 md:col-span-2">
              <span className="text-[#D4AF37]">Donor location:</span> {claimData.donorLocation}
            </p>
          </div>

          {claimPosition ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#D4AF37]/35">
              <MapContainer center={claimPosition} className="h-80 w-full" scrollWheelZoom zoom={14}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={claimPosition} />
              </MapContainer>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-sm text-[#f6e7b0]">
              Map preview unavailable because this claim does not have coordinate format.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export default ClaimLookupPage;
