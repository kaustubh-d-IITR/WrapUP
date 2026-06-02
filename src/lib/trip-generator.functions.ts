import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  mode: z.enum(["natural", "structured"]),
  prompt: z.string().max(4000).optional(),
  destination: z.string().max(200).optional(),
  budget: z.number().int().min(0).max(100_000_000).optional(),
  duration: z.number().int().min(1).max(60).optional(),
  travelers: z.number().int().min(1).max(50).optional(),
  style: z.string().max(100).optional(),
  interests: z.string().max(500).optional(),
});

const SYSTEM = `You are WrapUP, an expert AI travel planner.
You MUST respond with ONLY a single valid JSON object — no markdown, no commentary.

Required JSON schema (all keys required):
{
  "destination": string (e.g. "Kyoto, Japan"),
  "total_budget": number (integer, in the user's currency unit; default INR if unspecified),
  "currency": string ("INR" | "USD" | "EUR" etc.),
  "duration": number (days),
  "travelers": number,
  "style": string,
  "trip_summary": string (2-3 sentences),
  "highlights": string[] (5-7 items),
  "hotels": [{ "name": string, "rating": number, "price": string, "area": string }] (3 items),
  "daily_itinerary": [{ "day": number, "title": string, "location": string,
      "items": [{ "time": "HH:MM", "title": string, "desc": string }] (3-4 items) }] (one per day),
  "activities": [{ "name": string, "value": number }] (5 items, values sum to ~100),
  "food_recommendations": [{ "name": string, "desc": string }] (4-6 items),
  "transportation": [{ "mode": string, "detail": string, "cost": string }] (3 items),
  "budget_breakdown": [{ "name": "Stay"|"Food"|"Transport"|"Activities"|"Misc", "value": number }] (sum equals total_budget),
  "daily_costs": [{ "name": "Day 1"...,"cost": number }] (one per day, sum ~ total_budget),
  "travel_tips": string[] (4-6 items),
  "weather": [{ "day": "Mon"..., "high": number, "low": number, "cond": string }] (up to 7)
}

Rules:
- Honor every explicit user constraint (specific hotels, must-visit days, traveler count, budget cap).
- Be realistic with prices for the destination + currency.
- NEVER default to Bali unless explicitly requested.
- Output JSON ONLY.`;

function buildUserPrompt(input: z.infer<typeof InputSchema>) {
  if (input.mode === "natural") {
    return `User request:\n"""${input.prompt ?? ""}"""\n\nGenerate the trip JSON now.`;
  }
  return `Generate a trip with these parameters:
- Destination: ${input.destination}
- Budget: ${input.budget} (assume INR unless destination implies otherwise)
- Duration: ${input.duration} days
- Travelers: ${input.travelers}
- Travel style: ${input.style ?? "Balanced"}
- Interests: ${input.interests ?? "General sightseeing"}

Generate the trip JSON now.`;
}

export const generateTrip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildUserPrompt(data) },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Groq error", res.status, text);
      throw new Error(`Groq API error (${res.status})`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse Groq JSON:", content.slice(0, 500));
      throw new Error("AI returned malformed JSON. Try again.");
    }
    return parsed;
  });

export const checkGroqStatus = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { configured: false, ok: false, message: "GROQ_API_KEY missing" };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { configured: true, ok: res.ok, status: res.status };
  } catch (e) {
    return { configured: true, ok: false, message: (e as Error).message };
  }
});
