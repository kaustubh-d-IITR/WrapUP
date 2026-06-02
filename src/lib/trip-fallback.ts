import type { ValidatedTrip } from "./trip-schema";

// ── Fallback itinerary generator ───────────────────────────────────
// Produces a safe, reasonable trip when the AI response fails
// validation twice. Never crashes, always returns valid data.

interface FallbackInput {
  destination?: string;
  budget?: number;
  duration?: number;
  travelers?: number;
  style?: string;
  prompt?: string;
}

/** Extract a destination hint from a natural-language prompt. */
function guessDestination(prompt?: string): string {
  if (!prompt) return "Your Destination";
  // Match common patterns like "trip to X", "visit X", "X trip"
  const patterns = [
    /(?:trip|travel|visit|go|fly|honeymoon|vacation|holiday)\s+(?:to|in)\s+([A-Z][a-zA-Zà-ÿ\s,]+)/i,
    /([A-Z][a-zA-Zà-ÿ]+(?:\s+[A-Z][a-zA-Zà-ÿ]+)*)\s+trip/i,
  ];
  for (const p of patterns) {
    const m = prompt.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return "Your Destination";
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function generateFallbackTrip(input: FallbackInput): ValidatedTrip {
  const destination = input.destination || guessDestination(input.prompt) || "Your Destination";
  const duration = input.duration ?? 5;
  const travelers = input.travelers ?? 2;
  const budget = input.budget ?? 100_000;
  const style = input.style ?? "Balanced";
  const currency = "INR";

  const perDay = Math.round(budget / duration);
  const stayBudget = Math.round(budget * 0.35);
  const foodBudget = Math.round(budget * 0.20);
  const transportBudget = Math.round(budget * 0.18);
  const activitiesBudget = Math.round(budget * 0.18);
  const miscBudget = budget - stayBudget - foodBudget - transportBudget - activitiesBudget;

  return {
    destination,
    total_budget: budget,
    currency,
    duration,
    travelers,
    style,
    trip_summary: `A ${duration}-day ${style.toLowerCase()} trip to ${destination} for ${travelers} traveler${travelers > 1 ? "s" : ""}. This is an estimated itinerary — generate again for a personalized AI plan.`,
    highlights: [
      `Explore the heart of ${destination}`,
      "Visit iconic landmarks and attractions",
      "Sample authentic local cuisine",
      "Discover hidden gems off the beaten path",
      "Capture stunning photos at scenic viewpoints",
    ],
    hotels: [
      { name: `${destination} Central Hotel`, rating: 4.2, price: `₹${Math.round(stayBudget / duration).toLocaleString("en-IN")}/night`, area: "City Center" },
      { name: `${destination} Boutique Stay`, rating: 4.5, price: `₹${Math.round((stayBudget / duration) * 1.3).toLocaleString("en-IN")}/night`, area: "Old Town" },
      { name: `${destination} Budget Inn`, rating: 3.8, price: `₹${Math.round((stayBudget / duration) * 0.7).toLocaleString("en-IN")}/night`, area: "Near Station" },
    ],
    daily_itinerary: Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? "Arrival & Orientation" : i === duration - 1 ? "Final Sights & Departure" : `Day ${i + 1} — Explore ${destination}`,
      location: destination,
      items: [
        { time: "09:00", title: i === 0 ? "Check-in & settle" : "Morning exploration", desc: i === 0 ? "Arrive, drop luggage, fresh up" : "Start your day with local sights" },
        { time: "12:30", title: "Lunch", desc: `Try local cuisine at a popular ${destination} eatery` },
        { time: "15:00", title: "Afternoon activity", desc: `Visit a key attraction in ${destination}` },
        { time: "19:00", title: i === duration - 1 ? "Departure prep" : "Evening", desc: i === duration - 1 ? "Pack up and head to transport hub" : "Dinner and leisure time" },
      ],
    })),
    activities: [
      { name: "Sightseeing", value: 30 },
      { name: "Food & Dining", value: 25 },
      { name: "Culture", value: 20 },
      { name: "Shopping", value: 15 },
      { name: "Relaxation", value: 10 },
    ],
    food_recommendations: [
      { name: "Local street food", desc: `Must-try street food in ${destination}` },
      { name: "Traditional restaurant", desc: "Sit-down meal with authentic regional dishes" },
      { name: "Café hopping", desc: "Explore trendy cafés and bakeries" },
      { name: "Night market food", desc: "Evening food markets and stalls" },
    ],
    transportation: [
      { mode: "Airport/Station transfer", detail: `Private transfer to ${destination} center`, cost: `₹${Math.round(transportBudget * 0.25).toLocaleString("en-IN")}` },
      { mode: "Local transport", detail: "Metro/bus/taxi for daily commute", cost: `₹${Math.round(transportBudget * 0.15).toLocaleString("en-IN")}/day` },
      { mode: "Day-trip transport", detail: "Hire car or organized tour", cost: `₹${Math.round(transportBudget * 0.35).toLocaleString("en-IN")}` },
    ],
    budget_breakdown: [
      { name: "Stay", value: stayBudget },
      { name: "Food", value: foodBudget },
      { name: "Transport", value: transportBudget },
      { name: "Activities", value: activitiesBudget },
      { name: "Misc", value: miscBudget },
    ],
    daily_costs: Array.from({ length: duration }, (_, i) => ({
      name: `Day ${i + 1}`,
      cost: perDay + (i === 0 ? Math.round(perDay * 0.2) : i === duration - 1 ? Math.round(perDay * 0.15) : 0),
    })),
    travel_tips: [
      `Research visa requirements for ${destination} before booking`,
      "Keep digital and physical copies of important documents",
      "Inform your bank about international travel to avoid card blocks",
      `Download offline maps for ${destination}`,
      "Stay hydrated and carry a reusable water bottle",
      "Learn a few basic phrases in the local language",
    ],
    weather: DAYS_OF_WEEK.slice(0, Math.min(7, duration)).map((day) => ({
      day,
      high: 28,
      low: 18,
      cond: "Partly cloudy",
    })),
  };
}
