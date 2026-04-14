import { useState } from "react";
import { MapPin, PlusCircle, Timer } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { SERVER_URL } from "../lib/realtime";

const initialForm = {
  foodType: "",
  quantity: "",
  donorLocation: "",
  minutesToExpire: 30,
};

function LocationPicker({ markerPosition, onSelect }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onSelect([lat, lng]);
    },
  });

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

function DonorPage() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [markerPosition, setMarkerPosition] = useState([19.076, 72.8777]);

  async function submitDonation(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Unable to publish donation.");
      }
      setFormData(initialForm);
      setMarkerPosition([19.076, 72.8777]);
      setMessage("Donation posted to live responder feed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10">
      <section className="glass-panel rounded-3xl p-7 md:p-9">
        <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">Donor Portal</h1>
        <p className="mt-2 text-slate-300 font-ui">
          Post surplus batches in one tap. Your update appears live for responders.
        </p>

        <form className="mt-6 grid gap-5 lg:grid-cols-2" onSubmit={submitDonation}>
          <label className="block">
            <span className="label">Food Type</span>
            <input
              className="field"
              placeholder="Cooked rice, bread, fruit packs..."
              required
              value={formData.foodType}
              onChange={(e) => setFormData((s) => ({ ...s, foodType: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="label">Quantity</span>
            <input
              className="field"
              placeholder="e.g. 30 meal boxes"
              required
              value={formData.quantity}
              onChange={(e) => setFormData((s) => ({ ...s, quantity: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="label">Pickup Location</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="field pl-9"
                placeholder="Restaurant location"
                required
                value={formData.donorLocation}
                onChange={(e) => setFormData((s) => ({ ...s, donorLocation: e.target.value }))}
              />
            </div>
          </label>
          <label className="block">
            <span className="label">Expiry Timer (minutes)</span>
            <div className="relative">
              <Timer className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="field pl-9"
                type="number"
                min="1"
                max="120"
                value={formData.minutesToExpire}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, minutesToExpire: Number(e.target.value) }))
                }
              />
            </div>
          </label>
          <div className="lg:col-span-2">
            <p className="label mb-2">Set Location From Map</p>
            <div className="overflow-hidden rounded-xl border border-[#D4AF37]/35">
              <MapContainer
                center={markerPosition}
                className="h-64 w-full"
                scrollWheelZoom
                zoom={13}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker
                  markerPosition={markerPosition}
                  onSelect={(nextPosition) => {
                    setMarkerPosition(nextPosition);
                    setFormData((s) => ({
                      ...s,
                      donorLocation: `${nextPosition[0].toFixed(5)}, ${nextPosition[1].toFixed(5)}`,
                    }));
                  }}
                />
              </MapContainer>
            </div>
            <p className="mt-2 text-xs text-[#D4AF37]/80">
              Click anywhere on map to set pickup coordinates.
            </p>
          </div>
          <div className="lg:col-span-2">
            <button
              className="btn-primary w-full justify-center text-[#D4AF37]"
              disabled={loading}
              type="submit"
            >
              <PlusCircle size={16} />
              {loading ? "Publishing..." : "Publish Donation"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#F6E7B0]">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

export default DonorPage;
