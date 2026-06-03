import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Sparkles, TrendingUp, Compass, Plane, Wallet } from "lucide-react";
const recentTrips = [
  { id: "1", name: "Tokyo & Kyoto", date: "April 2026", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { id: "2", name: "Swiss Alps", date: "December 2025", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80" },
  { id: "3", name: "Bali Escape", date: "October 2025", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" }
];

const destinations = [
  { id: "1", name: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { id: "2", name: "Zermatt", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80" },
  { id: "3", name: "Ubud", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { id: "4", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e907a5ea071?w=800&q=80" }
];

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — WrapUP" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> Welcome back, traveler
        </div>
        <h1 className="mt-3 text-4xl md:text-6xl font-semibold leading-tight">
          Plan your next trip in <span className="text-gradient-brand">seconds.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Describe your dream getaway in plain English. WrapUP turns it into a visual, hour-by-hour itinerary you can actually use.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
        className="mt-8 glass rounded-2xl p-2 shadow-glow flex items-center gap-2">
        <div className="pl-3 text-muted-foreground"><Search className="h-5 w-5" /></div>
        <input placeholder="Where to next? e.g. ‘10-day Japan trip in spring for ₹2L’"
          className="flex-1 bg-transparent outline-none py-3 text-sm md:text-base placeholder:text-muted-foreground" />
        <Link to="/planner" className="rounded-xl bg-gradient-brand px-4 md:px-5 py-2.5 text-sm font-medium text-background shadow-glow">
          Plan
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Plane, label: "Trips planned", value: "12" },
          { icon: Compass, label: "Countries explored", value: "8" },
          { icon: Wallet, label: "Budget saved", value: "₹47K" },
          { icon: TrendingUp, label: "Avg trip score", value: "4.8" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            className="glass rounded-2xl p-5">
            <s.icon className="h-5 w-5 text-brand" />
            <div className="mt-3 text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Recent trips</h2>
          <Link to="/trip" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentTrips.map((t) => (
            <Link to="/trip" key={t.id} className="group glass rounded-2xl overflow-hidden hover:shadow-glow transition-all">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={t.img} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-4">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Popular destinations</h2>
          <Link to="/explore" className="text-sm text-brand hover:underline">Explore all</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {destinations.slice(0, 4).map((d) => (
            <Link to="/trip" key={d.id} className="group glass rounded-2xl overflow-hidden hover:shadow-glow transition-all">
              <div className="aspect-square overflow-hidden relative">
                <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-xs opacity-80">{d.country}</div>
                  <div className="font-semibold">{d.name}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
