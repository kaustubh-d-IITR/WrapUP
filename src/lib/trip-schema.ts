import { z } from "zod";

// ── Individual sub-schemas ─────────────────────────────────────────

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

// ── Full trip response schema ──────────────────────────────────────

export const TripResponseSchema = z.object({
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

export type ValidatedTrip = z.infer<typeof TripResponseSchema>;

// ── Validation result type ─────────────────────────────────────────

export type ValidationSuccess = {
  ok: true;
  data: ValidatedTrip;
};

export type ValidationFailure = {
  ok: false;
  errors: { path: string; message: string }[];
  rawKeys: string[];
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

// ── Validate function ──────────────────────────────────────────────

export function validateTripResponse(raw: unknown): ValidationResult {
  const result = TripResponseSchema.safeParse(raw);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  const rawKeys =
    raw && typeof raw === "object" ? Object.keys(raw) : [];

  return { ok: false, errors, rawKeys };
}
