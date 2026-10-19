import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import * as dotenv from "dotenv";

// Load from parent directory .env
dotenv.config({ path: "../.env" });

const app = express();

const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:8080"] 
  : "*";

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());

// ── Zod Schemas ────────────────────────────────────────────────────────
const HotelSchema = z.object({
  name: z.string().min(1),
  rating: z.coerce.number().min(0).max(5),
  price: z.string().min(1),
  area: z.string().min(1),
  placeId: z.string().optional(),
  photoUrl: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  address: z.string().optional(),
  realRating: z.number().optional(),
  reviewsCount: z.number().optional(),
});

const ItineraryItemSchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  desc: z.string().min(1),
  placeId: z.string().optional(),
  photoUrl: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const DayItinerarySchema = z.object({
  day: z.coerce.number().int().positive(),
  title: z.string().min(1),
  location: z.string().min(1),
  items: z.array(ItineraryItemSchema).min(1),
});

const ActivitySchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number().min(0),
});

const FoodSchema = z.object({
  name: z.string().min(1),
  desc: z.string().min(1),
  placeId: z.string().optional(),
  photoUrl: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  realRating: z.number().optional(),
  priceLevel: z.string().optional(),
  openStatus: z.string().optional(),
});

const TransportSchema = z.object({
  mode: z.string().min(1),
  detail: z.string().min(1),
  cost: z.string().min(1),
});

const BudgetItemSchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number().min(0),
});

const DailyCostSchema = z.object({
  name: z.string().min(1),
  cost: z.coerce.number().min(0),
});

const WeatherSchema = z.object({
  day: z.string().min(1),
  high: z.coerce.number(),
  low: z.coerce.number(),
  cond: z.string().min(1),
});

const TripResponseSchema = z.object({
  destination: z.string().min(1),
  total_budget: z.coerce.number().positive(),
  currency: z.string().min(1).default("INR"),
  duration: z.coerce.number().int().positive(),
  travelers: z.coerce.number().int().positive(),
  style: z.string().optional().default("Balanced"),
  trip_summary: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  hotels: z.array(HotelSchema).min(1),
  daily_itinerary: z.array(DayItinerarySchema).min(1),
  activities: z.array(ActivitySchema).min(1),
  food_recommendations: z.array(FoodSchema).min(1),
  transportation: z.array(TransportSchema).min(1),
  budget_breakdown: z.array(BudgetItemSchema).min(1),
  daily_costs: z.array(DailyCostSchema).min(1),
  travel_tips: z.array(z.string().min(1)).min(1),
  weather: z.array(WeatherSchema).optional().default([]),
});

// ── OpenStreetMap enrichment ───────────────────────────────────────
// Nominatim's public server allows about one request per second.
// Cap lookups so a generate call stays well under the host timeout.
const PLACE_LOOKUP_LIMIT = 8;
const NOMINATIM_GAP_MS = 1100;
const OSM_USER_AGENT = "WrapUP/1.0 (https://wrap-up-six.vercel.app)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGenericStop(title) {
  const titleLower = title.toLowerCase();
  return ["lunch", "breakfast", "dinner", "check-in", "check in", "departure"].some((word) => titleLower.includes(word));
}

async function searchPlace(query) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    const res = await fetch(url, {
      headers: { "User-Agent": OSM_USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const hit = data[0];
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      placeId: hit.place_id != null ? String(hit.place_id) : undefined,
      coordinates: { lat, lng },
      address: hit.display_name,
    };
  } catch (e) {
    console.error("Place lookup error:", e);
    return null;
  }
}

async function wikiPhoto(query) {
  const title = query.split(" in ")[0].trim();
  if (!title) return null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": OSM_USER_AGENT, "Api-User-Agent": OSM_USER_AGENT },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch (e) {
    console.error("Photo lookup error:", e);
    return null;
  }
}

async function enrichTrip(trip) {
  const enrichedTrip = JSON.parse(JSON.stringify(trip));
  const jobs = [];

  for (const hotel of enrichedTrip.hotels || []) {
    jobs.push({
      query: `${hotel.name} in ${trip.destination}`,
      apply(place) {
        hotel.placeId = place.placeId;
        hotel.coordinates = place.coordinates;
        if (place.address) hotel.address = place.address;
        if (place.photoUrl) hotel.photoUrl = place.photoUrl;
      },
    });
  }

  for (const food of enrichedTrip.food_recommendations || []) {
    jobs.push({
      query: `${food.name} in ${trip.destination}`,
      apply(place) {
        food.placeId = place.placeId;
        food.coordinates = place.coordinates;
        if (place.photoUrl) food.photoUrl = place.photoUrl;
      },
    });
  }

  for (const day of enrichedTrip.daily_itinerary || []) {
    for (const item of day.items || []) {
      if (isGenericStop(item.title || "")) continue;
      jobs.push({
        query: `${item.title} in ${day.location || trip.destination}`,
        apply(place) {
          item.placeId = place.placeId;
          item.coordinates = place.coordinates;
          if (place.photoUrl) item.photoUrl = place.photoUrl;
        },
      });
    }
  }

  const selected = jobs.slice(0, PLACE_LOOKUP_LIMIT);
  for (let i = 0; i < selected.length; i++) {
    const job = selected[i];
    const place = await searchPlace(job.query);
    if (place) {
      place.photoUrl = await wikiPhoto(job.query);
      job.apply(place);
    }
    if (i < selected.length - 1) await sleep(NOMINATIM_GAP_MS);
  }

  return enrichedTrip;
}

// ── AI Generation Logic ──────────────────────────────────────────────
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
  "travel_tips": string[] (Array of simple strings ONLY. DO NOT return objects. 4-6 items),
  "weather": [{ "day": "Mon"..., "high": number, "low": number, "cond": string }] (up to 7)
}

Rules:
- Honor every explicit user constraint.
- Be realistic with prices for the destination + currency.
- NEVER default to Bali unless explicitly requested.
- Output JSON ONLY.`;

function buildUserPrompt(input) {
  if (input.mode === "natural") {
    return `User request:\n"""${input.prompt || ""}"""\n\nGenerate the trip JSON now.`;
  }
  return `Generate a trip with these parameters:
- Destination: ${input.destination}
- Budget: ${input.budget} (assume INR unless destination implies otherwise)
- Duration: ${input.duration} days
- Travelers: ${input.travelers}
- Travel style: ${input.style || "Balanced"}
- Interests: ${input.interests || "General sightseeing"}

Generate the trip JSON now.`;
}

// ── API Routes ────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, service: "wrapup-backend" }));

app.get("/status/groq", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.json({ configured: false, ok: false, message: "GROQ_API_KEY missing on backend" });
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.json({ configured: true, ok: groqRes.ok, status: groqRes.status });
  } catch (e) {
    return res.json({ configured: true, ok: false, message: e.message });
  }
});

app.get("/status/maps", (_req, res) => {
  return res.json({ configured: true, ok: true, provider: "openstreetmap", message: "OpenStreetMap" });
});

app.get("/api-key/maps", (_req, res) => {
  return res.json({ key: null, provider: "openstreetmap" });
});

app.post("/generate-trip", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY is missing in backend environment" });

  try {
    let validation;
    let enriched;
    let aiStatus = "validated";
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // llama-3.3-70b-versatile was removed from Groq on 2026-08-16.
          // gpt-oss-120b is Groq's recommended replacement and supports JSON mode.
          model: "openai/gpt-oss-120b",
          temperature: attempt === 1 ? 0.7 : 0.4,
          max_completion_tokens: 8192,
          reasoning_effort: "low",
          include_reasoning: false,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: buildUserPrompt(req.body) },
          ],
        }),
      });

      if (!groqRes.ok) {
        if (attempt === 2) {
          const text = await groqRes.text();
          return res.status(groqRes.status).json({ error: `Groq API error: ${text}` });
        }
        continue;
      }

      const json = await groqRes.json();
      const content = json?.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        if (attempt === 2) return res.status(500).json({ error: "Malformed JSON returned by AI", raw: content });
        continue;
      }

      validation = TripResponseSchema.safeParse(parsed);
      if (validation.success) {
        if (attempt === 2) aiStatus = "retry_used";
        break; // Validation passed!
      } else if (attempt === 2) {
        return res.status(500).json({ 
          error: "AI response failed schema validation", 
          issues: validation.error.issues 
        });
      }
    }

    if (validation && validation.success) {
      enriched = await enrichTrip(validation.data);
      res.json({ ...enriched, _ai_status: aiStatus });
    }
  } catch (error) {
    console.error("Generate trip error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Swagger docs definition
const swaggerDocument = {
  openapi: "3.0.0",
  info: { title: "WrapUP API", version: "0.1.0" },
  servers: [{ url: process.env.API_BASE_URL || "http://localhost:8787" }],
  paths: {
    "/generate-trip": {
      post: {
        summary: "Generate Trip",
        requestBody: { content: { "application/json": {} } },
        responses: { "200": { description: "Successful response" } }
      }
    }
  }
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`WrapUP backend on :${port}`));
