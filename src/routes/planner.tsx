import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Users, IndianRupee, Clock, MapPin, MessageSquare, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateTrip } from "@/lib/trip-generator.functions";
import { tripStorage } from "@/lib/storage";
import type { GeneratedTrip } from "@/lib/trip-types";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Planner — WrapUP" }] }),
  component: Planner,
});

const placeholders = [
  "Plan a luxury Switzerland trip in summer for 2 people under ₹3L",
  "Plan a budget Bali trip for 7 days under ₹80k",
  "Plan a honeymoon in Paris, 5 nights, around €3000",
  "Plan a Japan trip and make sure we stay at Park Hyatt Tokyo and visit Mount Fuji on Day 3",
];

type Mode = "select" | "natural" | "structured";

function Planner() {
  const navigate = useNavigate();
  const callGenerate = useServerFn(generateTrip);
  const [mode, setMode] = useState<Mode>("select");
  const [prompt, setPrompt] = useState("");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("100000");
  const [travelers, setTravelers] = useState("2");
  const [style, setStyle] = useState("Balanced");
  const [duration, setDuration] = useState("7");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const payload =
        mode === "natural"
          ? { mode: "natural" as const, prompt }
          : {
              mode: "structured" as const,
              destination,
              budget: Number(budget),
              duration: Number(duration),
              travelers: Number(travelers),
              style,
              interests,
            };

      const raw = await callGenerate({ data: payload });
      const trip: GeneratedTrip = {
        id: `trip_${Date.now()}`,
        createdAt: Date.now(),
        currency: "INR",
        ...raw,
      };
      tripStorage.setCurrent(trip);
      tripStorage.addToHistory(trip);
      navigate({ to: "/trip" });
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "Failed to generate trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> AI Planner
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold">
          Describe your trip. <span className="text-gradient-brand">We'll design it.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">Choose how you want to plan — your way.</p>
      </motion.div>

      {/* Mode selector */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModeCard
          active={mode === "natural"}
          icon={MessageSquare}
          title="Natural Language"
          desc="Describe your trip in plain English. AI extracts everything."
          onClick={() => setMode("natural")}
        />
        <ModeCard
          active={mode === "structured"}
          icon={SlidersHorizontal}
          title="Structured Planning"
          desc="Fill in destination, budget, days and preferences."
          onClick={() => setMode("structured")}
        />
      </div>

      <AnimatePresence mode="wait">
        {mode === "natural" && (
          <motion.div
            key="nl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 glass rounded-3xl p-5 md:p-7 shadow-glow"
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder={placeholders[0]}
              className="w-full resize-none bg-transparent outline-none text-base md:text-lg placeholder:text-muted-foreground"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {placeholders.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-brand transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === "structured" && (
          <motion.div
            key="struct"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <Field icon={MapPin} label="Destination" value={destination} onChange={setDestination} placeholder="e.g. Kyoto, Japan" />
            <Field icon={IndianRupee} label="Budget (₹)" value={budget} onChange={setBudget} type="number" />
            <Field icon={Clock} label="Days" value={duration} onChange={setDuration} type="number" />
            <Field icon={Users} label="Travelers" value={travelers} onChange={setTravelers} type="number" />
            <SelectField
              icon={Wand2}
              label="Style"
              value={style}
              onChange={setStyle}
              options={["Balanced", "Luxury", "Budget", "Adventure", "Honeymoon", "Family"]}
            />
            <Field icon={Sparkles} label="Interests" value={interests} onChange={setInterests} placeholder="food, hiking, museums" />
          </motion.div>
        )}
      </AnimatePresence>

      {mode !== "select" && (
        <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-destructive">{error}</div>
          <button
            onClick={generate}
            disabled={loading || (mode === "natural" ? !prompt.trim() : !destination.trim())}
            className="rounded-2xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-background shadow-glow disabled:opacity-60 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Crafting your itinerary…
              </>
            ) : (
              <>Generate Plan ✨</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ModeCard({
  active,
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: any;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left glass rounded-2xl p-5 transition-all hover:shadow-glow ${
        active ? "ring-2 ring-brand shadow-glow" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-background">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
    </button>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="glass rounded-2xl px-4 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/60"
      />
    </label>
  );
}

function SelectField({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="glass rounded-2xl px-4 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-sm font-medium"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
