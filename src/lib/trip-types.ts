import type { AIStatus } from "./trip-generator.functions";

export type GeneratedTrip = {
  id: string;
  createdAt: number;
  destination: string;
  total_budget: number;
  currency: string;
  duration: number;
  travelers: number;
  style?: string;
  trip_summary: string;
  highlights: string[];
  hotels: { 
    name: string; rating: number; price: string; area: string;
    placeId?: string; photoUrl?: string; coordinates?: { lat: number; lng: number };
    address?: string; realRating?: number; reviewsCount?: number;
  }[];
  daily_itinerary: {
    day: number;
    title: string;
    location: string;
    items: { 
      time: string; title: string; desc: string;
      placeId?: string; photoUrl?: string; coordinates?: { lat: number; lng: number };
    }[];
  }[];
  activities: { name: string; value: number }[];
  food_recommendations: { 
    name: string; desc: string;
    placeId?: string; photoUrl?: string; coordinates?: { lat: number; lng: number };
    realRating?: number; priceLevel?: string; openStatus?: string;
  }[];
  transportation: { mode: string; detail: string; cost: string }[];
  budget_breakdown: { name: string; value: number }[];
  daily_costs: { name: string; cost: number }[];
  travel_tips: string[];
  weather: { day: string; high: number; low: number; cond: string }[];
  _ai_status?: AIStatus;
};

