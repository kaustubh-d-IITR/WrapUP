import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Cloud, MapPin, Star, Bed, Bus, Sparkles, Heart, Utensils, Lightbulb, ShieldCheck, RotateCw, ShieldAlert } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tripStorage } from "@/lib/storage";
import type { GeneratedTrip } from "@/lib/trip-types";
import { getGoogleMapsKey } from "@/lib/trip-generator.functions";
import { TripMap } from "@/components/TripMap";

export const Route = createFileRoute("/trip")({
  head: () => ({ meta: [{ title: "Trip Details — WrapUP" }] }),
  component: Trip,
});

const COLORS = ["#00D4FF", "#00FFB3", "#5EEAD4", "#7CC4FF", "#A78BFA"];

function fmtMoney(n: number, currency = "INR") {
  if (currency === "INR") return `₹${n.toLocaleString("en-IN")}`;
  if (currency === "USD") return `$${n.toLocaleString()}`;
  if (currency === "EUR") return `€${n.toLocaleString()}`;
  return `${currency} ${n.toLocaleString()}`;
}

function Trip() {
  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [fav, setFav] = useState(false);
  const getMapsKey = useServerFn(getGoogleMapsKey);
  const [mapsKey, setMapsKey] = useState<string | null>(null);

  useEffect(() => {
    const t = tripStorage.getCurrent();
    setTrip(t);
    if (t) setFav(tripStorage.isFavorite(t.id));
    getMapsKey().then(res => setMapsKey(res.key));
  }, []);

  if (!trip) {
    return (
      <div className="px-5 md:px-10 py-16 max-w-3xl mx-auto text-center">
        <div className="glass rounded-3xl p-10">
          <Sparkles className="h-8 w-8 text-brand mx-auto" />
          <h1 className="mt-3 text-2xl font-semibold">No trip yet</h1>
          <p className="mt-2 text-muted-foreground">Generate your first AI-crafted itinerary to see it here.</p>
          <Link to="/planner" className="mt-6 inline-flex rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-medium text-background shadow-glow">
            Plan a trip
          </Link>
        </div>
      </div>
    );
  }

  const t = trip;
  const currency = t.currency || "INR";

  function toggleFav() {
    const isNow = tripStorage.toggleFavorite(t);
    setFav(isNow);
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> Generated itinerary
        </div>
        <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold">{t.destination}</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">{t.trip_summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{t.duration} days</Pill>
            <Pill>{t.travelers} travelers</Pill>
            <Pill>{fmtMoney(t.total_budget, currency)} budget</Pill>
            {t.style && <Pill>{t.style}</Pill>}
            <AIStatusBadge status={t._ai_status} />
            <button
              onClick={toggleFav}
              className={`glass rounded-full p-2 transition-colors ${fav ? "text-rose-400" : "text-muted-foreground"}`}
              aria-label="Toggle favorite"
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Top grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Budget distribution" subtitle={fmtMoney(t.total_budget, currency) + " total"}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={t.budget_breakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {t.budget_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <Legend items={t.budget_breakdown.map((b, i) => ({ name: b.name, color: COLORS[i % COLORS.length], value: fmtMoney(b.value, currency) }))} />
        </ChartCard>

        <ChartCard title="Daily cost breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={t.daily_costs}>
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "color-mix(in oklab, var(--brand) 10%, transparent)" }} />
              <Bar dataKey="cost" fill="url(#barG)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#00FFB3" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Activity mix">
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="30%" outerRadius="100%" data={t.activities} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={8}>
                {t.activities.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </RadialBar>
              <Tooltip contentStyle={tooltipStyle} />
            </RadialBarChart>
          </ResponsiveContainer>
          <Legend items={t.activities.map((a, i) => ({ name: a.name, color: COLORS[i % COLORS.length], value: `${a.value}%` }))} />
        </ChartCard>
      </div>

      {/* Highlights & weather */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-brand" /> Trip highlights</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {t.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-gradient-brand" /> {h}
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Cloud className="h-4 w-4 text-brand" /> Weather</h3>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {(t.weather || []).map((w, idx) => (
              <div key={idx} className="rounded-xl bg-accent/50 text-center py-2">
                <div className="text-[10px] text-muted-foreground">{w.day}</div>
                <div className="text-sm font-semibold">{w.high}°</div>
                <div className="text-[10px] text-muted-foreground">{w.low}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-brand" /> Interactive map</h2>
        <div className="mt-6">
          <TripMap trip={t} mapsKey={mapsKey} />
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><Calendar className="h-5 w-5 text-brand" /> Itinerary</h2>
        <div className="mt-6 relative">
          <div className="absolute left-4 md:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-brand/60 via-border to-transparent" />
          <div className="space-y-5">
            {t.daily_itinerary.map((d, i) => (
              <motion.div key={d.day} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.05 * i }} className="relative pl-12 md:pl-16">
                <div className="absolute left-0 md:left-2 top-3 h-8 w-8 rounded-xl bg-gradient-brand text-background grid place-items-center font-semibold text-sm shadow-glow">{d.day}</div>
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {d.location}</div>
                      <div className="text-lg font-semibold">{d.title}</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {d.items.map((it, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="shrink-0 w-14 text-xs text-brand font-medium pt-0.5">{it.time}</div>
                        <div className="flex-1">
                          <div className="font-medium">{it.title}</div>
                          <div className="text-muted-foreground text-xs mt-0.5">{it.desc}</div>
                          {it.photoUrl && (
                            <div className="mt-2 h-32 w-full max-w-md rounded-lg overflow-hidden bg-muted">
                              <img src={it.photoUrl} alt={it.title} className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotels & transport */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Bed className="h-4 w-4 text-brand" /> Hotel recommendations</h3>
          <div className="mt-4 space-y-3">
            {t.hotels.map((h, i) => (
              <div key={i} className="flex overflow-hidden rounded-xl border border-border">
                {h.photoUrl && (
                  <div className="w-24 shrink-0 bg-muted">
                    <img src={h.photoUrl} alt={h.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {h.address || h.area} • ⭐ {h.realRating || h.rating} {h.reviewsCount ? `(${h.reviewsCount})` : ''}
                  </div>
                  <div className="text-sm font-semibold text-brand mt-2">{h.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Bus className="h-4 w-4 text-brand" /> Transport</h3>
          <div className="mt-4 space-y-3">
            {t.transportation.map((tr, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <div className="font-medium">{tr.mode}</div>
                  <div className="text-xs text-muted-foreground">{tr.detail}</div>
                </div>
                <div className="text-sm font-semibold text-brand">{tr.cost}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Food & tips */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Utensils className="h-4 w-4 text-brand" /> Food recommendations</h3>
          <div className="mt-4 space-y-3">
            {(t.food_recommendations || []).map((f, i) => (
              <div key={i} className="flex overflow-hidden rounded-xl border border-border">
                {f.photoUrl && (
                  <div className="w-24 shrink-0 bg-muted">
                    <img src={f.photoUrl} alt={f.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="font-medium text-sm">{f.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                  {(f.realRating || f.priceLevel || f.openStatus) && (
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                      {f.realRating && <span>⭐ {f.realRating}</span>}
                      {f.priceLevel && <span>• {f.priceLevel}</span>}
                      {f.openStatus && <span>• {f.openStatus}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-brand" /> Travel tips</h3>
          <ul className="mt-4 space-y-2">
            {(t.travel_tips || []).map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-brand">•</span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="glass rounded-full px-3 py-1.5 text-xs font-medium">{children}</span>;
}
function AIStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const config = {
    validated: {
      icon: ShieldCheck,
      label: "AI Response Validated",
      className: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    },
    retry_used: {
      icon: RotateCw,
      label: "AI Retry Used",
      className: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    },
    fallback_used: {
      icon: ShieldAlert,
      label: "Fallback Used",
      className: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    },
  }[status] ?? null;

  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${config.className}`}
      title={config.label}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-end justify-between">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Legend({ items }: { items: { name: string; color: string; value: string }[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
      {items.map((it) => (
        <div key={it.name} className="flex items-center justify-between">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: it.color }} />{it.name}</span>
          <span className="text-muted-foreground">{it.value}</span>
        </div>
      ))}
    </div>
  );
}
