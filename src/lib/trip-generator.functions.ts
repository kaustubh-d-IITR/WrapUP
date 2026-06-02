import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { validateTripResponse, type ValidatedTrip } from "./trip-schema";
import { generateFallbackTrip } from "./trip-fallback";
import { enrichTrip } from "./maps-enrichment";

// ── AI validation status (flows to the client via the response) ────
export type AIStatus = "validated" | "retry_used" | "fallback_used";

// ── Input schema ───────────────────────────────────────────────────

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

type Input = z.infer<typeof InputSchema>;

// ── System prompt ──────────────────────────────────────────────────

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

// ── Structured logging ─────────────────────────────────────────────

function logValidation(event: string, details: Record<string, unknown> = {}) {
  const timestamp = new Date().toISOString();
  const prefix = `[WrapUP:Validation ${timestamp}]`;

  switch (event) {
    case "ATTEMPT":
      console.log(`${prefix} 🔄 AI call attempt #${details.attempt}`);
      break;
    case "PARSE_SUCCESS":
      console.log(`${prefix} ✅ JSON parsed — keys: ${details.keys}`);
      break;
    case "PARSE_FAILURE":
      console.error(`${prefix} ❌ JSON parse failed — raw: ${details.raw}`);
      break;
    case "VALIDATION_SUCCESS":
      console.log(`${prefix} ✅ Schema validation passed — destination: ${details.destination}`);
      break;
    case "VALIDATION_FAILURE":
      console.warn(`${prefix} ⚠️ Schema validation failed — ${details.errorCount} errors:`);
      if (Array.isArray(details.errors)) {
        for (const err of details.errors as { path: string; message: string }[]) {
          console.warn(`  → [${err.path || "root"}] ${err.message}`);
        }
      }
      if (details.rawKeys) {
        console.warn(`  → Present keys: ${details.rawKeys}`);
      }
      break;
    case "RETRY":
      console.warn(`${prefix} 🔁 Retrying AI call (attempt #${details.attempt})…`);
      break;
    case "FALLBACK":
      console.warn(`${prefix} 🛡️ Using fallback itinerary for "${details.destination}"`);
      break;
    case "API_ERROR":
      console.error(`${prefix} ❌ Groq API error — status: ${details.status}, body: ${details.body}`);
      break;
    case "API_KEY_MISSING":
      console.error(`${prefix} ❌ GROQ_API_KEY is not configured`);
      break;
    default:
      console.log(`${prefix} ${event}`, details);
  }
}

// ── Build user prompt ──────────────────────────────────────────────

function buildUserPrompt(input: Input) {
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

// ── Extract fallback inputs from user data ─────────────────────────

function toFallbackInput(data: Input) {
  return {
    destination: data.destination,
    budget: data.budget,
    duration: data.duration,
    travelers: data.travelers,
    style: data.style,
    prompt: data.prompt,
  };
}

// ── Single Groq API call ───────────────────────────────────────────

async function callGroq(
  apiKey: string,
  data: Input,
  attempt: number,
): Promise<{ parsed: unknown; raw: string } | { error: string }> {
  logValidation("ATTEMPT", { attempt });

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: attempt === 1 ? 0.7 : 0.4, // lower temp on retry for safer output
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildUserPrompt(data) },
        ],
      }),
    });
  } catch (e) {
    const msg = (e as Error).message;
    logValidation("API_ERROR", { status: "network", body: msg });
    return { error: `Network error: ${msg}` };
  }

  if (!res.ok) {
    const text = await res.text();
    logValidation("API_ERROR", { status: res.status, body: text.slice(0, 300) });
    return { error: `Groq API error (${res.status})` };
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content);
    const keys = parsed && typeof parsed === "object" ? Object.keys(parsed) : [];
    logValidation("PARSE_SUCCESS", { keys: keys.join(", ") });
    return { parsed, raw: content };
  } catch {
    logValidation("PARSE_FAILURE", { raw: content.slice(0, 500) });
    return { error: "Malformed JSON in AI response" };
  }
}

// ── Main handler with validation → retry → fallback ────────────────

export const generateTrip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ValidatedTrip & { _ai_status: AIStatus }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logValidation("API_KEY_MISSING");
      logValidation("FALLBACK", { destination: data.destination ?? "unknown" });
      const fb = generateFallbackTrip(toFallbackInput(data));
      return { ...fb, _ai_status: "fallback_used" };
    }

    // ── Attempt 1 ────────────────────────────────────────────────
    const result1 = await callGroq(apiKey, data, 1);

    if ("parsed" in result1) {
      const v1 = validateTripResponse(result1.parsed);
      if (v1.ok) {
        logValidation("VALIDATION_SUCCESS", { destination: v1.data.destination });
        const enriched = await enrichTrip(v1.data, process.env.GOOGLE_MAPS_API_KEY || "");
        return { ...enriched, _ai_status: "validated" };
      }
      logValidation("VALIDATION_FAILURE", {
        errorCount: v1.errors.length,
        errors: v1.errors,
        rawKeys: v1.rawKeys.join(", "),
      });
    }

    // ── Attempt 2 (retry) ────────────────────────────────────────
    logValidation("RETRY", { attempt: 2 });
    const result2 = await callGroq(apiKey, data, 2);

    if ("parsed" in result2) {
      const v2 = validateTripResponse(result2.parsed);
      if (v2.ok) {
        logValidation("VALIDATION_SUCCESS", { destination: v2.data.destination });
        const enriched = await enrichTrip(v2.data, process.env.GOOGLE_MAPS_API_KEY || "");
        return { ...enriched, _ai_status: "retry_used" };
      }
      logValidation("VALIDATION_FAILURE", {
        errorCount: v2.errors.length,
        errors: v2.errors,
        rawKeys: v2.rawKeys.join(", "),
      });
    }

    // ── Fallback ─────────────────────────────────────────────────
    const dest = data.destination ?? "unknown";
    logValidation("FALLBACK", { destination: dest });
    const fb = generateFallbackTrip(toFallbackInput(data));
    const enrichedFb = await enrichTrip(fb, process.env.GOOGLE_MAPS_API_KEY || "");
    return { ...enrichedFb, _ai_status: "fallback_used" };
  });

// ── Health check (unchanged) ───────────────────────────────────────

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

export const getGoogleMapsKey = createServerFn({ method: "GET" }).handler(async () => {
  return { key: process.env.GOOGLE_MAPS_API_KEY || null };
});

export const checkMapsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { configured: false, ok: false, message: "GOOGLE_MAPS_API_KEY missing" };
  // A simple validation: does the key have the right format (usually starts with AIza)
  const isLikelyValid = apiKey.startsWith("AIza");
  return { configured: true, ok: isLikelyValid, status: isLikelyValid ? 200 : 400 };
});
