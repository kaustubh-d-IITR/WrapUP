import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Users, IndianRupee, Clock, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Planner — WrapUP" }] }),
  component: Planner,
});

const placeholders = [
  "Plan a luxury Switzerland trip in summer for 2 people",
  "Plan a budget Bali trip for 7 days under ₹80k",
  "Create a honeymoon itinerary for Paris, 5 nights",
];

function Planner() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [destination, setDestination] = useState("Bali");
  const [budget, setBudget] = useState("100000");
  const [travelers, setTravelers] = useState("2");
  const [style, setStyle] = useState("Balanced");
  const [duration, setDuration] = useState("7");
  const [loading, setLoading] = useState(false);

  function generate() {
    setLoading(true);
    setTimeout(() => navigate({ to: "/trip" }), 900);
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> AI Planner
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold">Describe your trip. <span className="text-gradient-brand">We'll design it.</span></h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mt-8 glass rounded-3xl p-5 md:p-7 shadow-glow">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder={placeholders[0]}
          className="w-full resize-none bg-transparent outline-none text-base md:text-lg placeholder:text-muted-foreground"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {placeholders.map((p) => (
            <button key={p} onClick={() => setPrompt(p)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-brand transition-colors">
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Field icon={MapPin} label="Destination" value={destination} onChange={setDestination} />
        <Field icon={IndianRupee} label="Budget (₹)" value={budget} onChange={setBudget} type="number" />
        <Field icon={Users} label="Travelers" value={travelers} onChange={setTravelers} type="number" />
        <SelectField icon={Wand2} label="Style" value={style} onChange={setStyle}
          options={["Balanced", "Luxury", "Budget", "Adventure", "Honeymoon", "Family"]} />
        <Field icon={Clock} label="Days" value={duration} onChange={setDuration} type="number" />
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={generate} disabled={loading}
          className="rounded-2xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-70">
          {loading ? "Crafting your itinerary..." : "Generate Plan ✨"}
        </button>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text" }: { icon: any; label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="glass rounded-2xl px-4 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Icon className="h-3 w-3" />{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none text-sm font-medium" />
    </label>
  );
}

function SelectField({ icon: Icon, label, value, onChange, options }: { icon: any; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="glass rounded-2xl px-4 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Icon className="h-3 w-3" />{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none text-sm font-medium">
        {options.map((o) => <option key={o} value={o} className="bg-background">{o}</option>)}
      </select>
    </label>
  );
}
