import {
  ArrowRight,
  MoveRight,
  ScanSearch,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

const projectCards = [
  {
    title: "Responder Intelligence",
    body: "Live queue, expiry triage, and immediate claim propagation.",
  },
  {
    title: "Donor Ops Console",
    body: "One-screen posting with map-assisted pickup coordinates.",
  },
  {
    title: "Impact Analytics",
    body: "Structured event stream designed for rescue KPI dashboards.",
  },
];

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-12">
      <section className="relative border-b border-white/15 pb-10">
        <p className="font-ui mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-300">
          <Sparkles size={14} /> Dark Operations UI
        </p>
        <h1 className="font-display max-w-5xl text-5xl leading-[1.02] text-slate-100 md:text-7xl">
          High-velocity food rescue platform with editorial precision.
        </h1>
        <p className="font-ui mt-6 max-w-3xl text-sm leading-7 tracking-[0.07em] text-slate-300 md:text-base">
          Inspired by premium studio interfaces, SharePlate combines a refined dark composition with
          mission-critical realtime logistics. Every action is designed to be clear, immediate, and
          operationally trustworthy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="lux-btn" to="/donor">
            Donor Console <ArrowRight size={16} />
          </Link>
          <Link className="lux-btn-muted" to="/responder">
            Responder Console
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {projectCards.map((card) => (
          <article key={card.title} className="stagger-card min-h-[250px]">
            <p className="font-ui text-xs uppercase tracking-[0.2em] text-slate-400">Project</p>
            <h3 className="font-display mt-3 text-2xl text-slate-100">{card.title}</h3>
            <p className="font-ui mt-3 text-sm tracking-[0.08em] text-slate-300">{card.body}</p>
            <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-200">
              Learn More <MoveRight size={14} />
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="lux-panel">
          <p className="font-ui text-xs uppercase tracking-[0.2em] text-slate-400">Services</p>
          <h3 className="font-display mt-2 text-3xl text-slate-100">Systems engineered for action</h3>
          <ul className="mt-5 space-y-3 font-ui text-sm tracking-[0.08em] text-slate-300">
            <li className="lux-line py-2">Realtime event transport and queue synchronization</li>
            <li className="lux-line py-2">Single-claim concurrency guardrails</li>
            <li className="lux-line py-2">Map-assisted donor capture and responder visibility</li>
          </ul>
        </article>
        <article className="lux-panel">
          <p className="font-ui text-xs uppercase tracking-[0.2em] text-slate-400">How It Works</p>
          <h3 className="font-display mt-2 text-3xl text-slate-100">From Idea to Rescue</h3>
          <div className="mt-5 space-y-3">
            <div className="lux-step">
              <ScanSearch size={16} />
              <p>Donors post details with map-picked location.</p>
            </div>
            <div className="lux-step">
              <Workflow size={16} />
              <p>Responders receive instant feed updates and triage by expiry.</p>
            </div>
            <div className="lux-step">
              <ArrowRight size={16} />
              <p>Single claim lock confirms pickup and closes concurrency.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default HomePage;
