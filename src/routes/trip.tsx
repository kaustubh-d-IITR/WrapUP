import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Cloud, MapPin, Star, Bed, Bus, Sparkles } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { sampleTrip } from "@/lib/mock-data";

export const Route = createFileRoute("/trip")({
  head: () => ({ meta: [{ title: "Trip Details — WrapUP" }] }),
  component: Trip,
});

const COLORS = ["#00D4FF", "#00FFB3", "#5EEAD4", "#7CC4FF", "#A78BFA"];

function Trip() {
  const t = sampleTrip;

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
            <p className="mt-2 text-muted-foreground max-w-2xl">{t.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>{t.duration} days</Pill>
            <Pill>{t.travelers} travelers</Pill>
            <Pill>₹{(t.budgetTotal / 1000).toFixed(0)}k budget</Pill>
            <Pill>{t.style}</Pill>
          </div>
        </div>
      </motion.div>

      {/* Top grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Budget distribution" subtitle={`₹${t.budgetTotal.toLocaleString()} total`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={t.budgetBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {t.budgetBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <Legend items={t.budgetBreakdown.map((b, i) => ({ name: b.name, color: COLORS[i % COLORS.length], value: `₹${(b.value/1000).toFixed(0)}k` }))} />
        </ChartCard>

        <ChartCard title="Daily cost breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={t.costBars}>
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
            <RadialBarChart innerRadius="30%" outerRadius="100%" data={t.activityMix} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={8}>
                {t.activityMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </RadialBar>
              <Tooltip contentStyle={tooltipStyle} />
            </RadialBarChart>
          </ResponsiveContainer>
          <Legend items={t.activityMix.map((a, i) => ({ name: a.name, color: COLORS[i % COLORS.length], value: `${a.value}%` }))} />
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
            {t.weather.map((w) => (
              <div key={w.day} className="rounded-xl bg-accent/50 text-center py-2">
                <div className="text-[10px] text-muted-foreground">{w.day}</div>
                <div className="text-sm font-semibold">{w.high}°</div>
                <div className="text-[10px] text-muted-foreground">{w.low}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><Calendar className="h-5 w-5 text-brand" /> Itinerary</h2>
        <div className="mt-6 relative">
          <div className="absolute left-4 md:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-brand/60 via-border to-transparent" />
          <div className="space-y-5">
            {t.days.map((d, i) => (
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
                  <div className="mt-4 space-y-3">
                    {d.items.map((it, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="shrink-0 w-14 text-xs text-brand font-medium pt-0.5">{it.time}</div>
                        <div>
                          <div className="font-medium">{it.title}</div>
                          <div className="text-muted-foreground text-xs mt-0.5">{it.desc}</div>
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
            {t.hotels.map((h) => (
              <div key={h.name} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <div className="font-medium">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.area} • ⭐ {h.rating}</div>
                </div>
                <div className="text-sm font-semibold text-brand">{h.price}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Bus className="h-4 w-4 text-brand" /> Transport</h3>
          <div className="mt-4 space-y-3">
            {t.transport.map((tr) => (
              <div key={tr.mode} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
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
