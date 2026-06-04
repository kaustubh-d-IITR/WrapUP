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

// ── Google Maps Enrichment ─────────────────────────────────────────────
async function enrichTrip(trip, apiKey) {
  if (!apiKey) return trip;
  const enrichedTrip = JSON.parse(JSON.stringify(trip));

  async function searchPlace(query) {
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.priceLevel,places.regularOpeningHours,places.photos",
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.places || data.places.length === 0) return null;
      return data.places[0];
    } catch (e) {
      console.error("Maps API error:", e);
      return null;
    }
  }

  function getPhotoUrl(photoName) {
    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`;
  }

  // Enrich Hotels
  if (enrichedTrip.hotels) {
    await Promise.all(
      enrichedTrip.hotels.map(async (hotel) => {
        const place = await searchPlace(`${hotel.name} in ${trip.destination}`);
        if (place) {
          hotel.placeId = place.id;
          if (place.location) hotel.coordinates = { lat: place.location.latitude, lng: place.location.longitude };
          if (place.formattedAddress) hotel.address = place.formattedAddress;
          if (place.rating) hotel.realRating = place.rating;
          if (place.userRatingCount) hotel.reviewsCount = place.userRatingCount;
          if (place.photos && place.photos.length > 0) hotel.photoUrl = getPhotoUrl(place.photos[0].name);
        }
      })
    );
  }

  // Enrich Food
  if (enrichedTrip.food_recommendations) {
    await Promise.all(
      enrichedTrip.food_recommendations.map(async (food) => {
        const place = await searchPlace(`${food.name} in ${trip.destination}`);
        if (place) {
          food.placeId = place.id;
          if (place.location) food.coordinates = { lat: place.location.latitude, lng: place.location.longitude };
          if (place.rating) food.realRating = place.rating;
          if (place.priceLevel) food.priceLevel = place.priceLevel;
          if (place.regularOpeningHours?.openNow !== undefined) {
            food.openStatus = place.regularOpeningHours.openNow ? "Open Now" : "Closed";
          }
          if (place.photos && place.photos.length > 0) food.photoUrl = getPhotoUrl(place.photos[0].name);
        }
      })
    );
  }

  // Enrich Daily Itinerary
  if (enrichedTrip.daily_itinerary) {
    await Promise.all(
      enrichedTrip.daily_itinerary.map(async (day) => {
        await Promise.all(
          day.items.map(async (item) => {
            const titleLower = item.title.toLowerCase();
            if (titleLower.includes("lunch") || titleLower.includes("breakfast") || titleLower.includes("dinner") || titleLower.includes("check-in") || titleLower.includes("departure")) {
              return;
            }
            const place = await searchPlace(`${item.title} in ${day.location || trip.destination}`);
            if (place) {
              item.placeId = place.id;
              if (place.location) item.coordinates = { lat: place.location.latitude, lng: place.location.longitude };
              if (place.photos && place.photos.length > 0) item.photoUrl = getPhotoUrl(place.photos[0].name);
            }
          })
        );
      })
    );
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

app.get("/status/maps", (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return res.json({ configured: false, ok: false, message: "GOOGLE_MAPS_API_KEY missing on backend" });
  const isLikelyValid = apiKey.startsWith("AIza");
  return res.json({ configured: true, ok: isLikelyValid, status: isLikelyValid ? 200 : 400 });
});

app.get("/api-key/maps", (req, res) => {
  return res.json({ key: process.env.GOOGLE_MAPS_API_KEY || null });
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
          model: "llama-3.3-70b-versatile",
          temperature: attempt === 1 ? 0.7 : 0.4,
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
      enriched = await enrichTrip(validation.data, process.env.GOOGLE_MAPS_API_KEY || "");
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
