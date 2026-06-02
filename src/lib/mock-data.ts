export type Destination = {
  id: string;
  name: string;
  country: string;
  image: string;
  budget: string;
  season: string;
  popularity: number;
  tagline: string;
};

export const destinations: Destination[] = [
  { id: "bali", name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80", budget: "₹70k – ₹1.2L", season: "Apr – Oct", popularity: 96, tagline: "Beaches, rice terraces & temples" },
  { id: "dubai", name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80", budget: "₹90k – ₹1.6L", season: "Nov – Mar", popularity: 92, tagline: "Skyline, desert & luxury" },
  { id: "paris", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80", budget: "₹1.3L – ₹2.4L", season: "Apr – Jun", popularity: 95, tagline: "Art, cafés & timeless romance" },
  { id: "tokyo", name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80", budget: "₹1.4L – ₹2.6L", season: "Mar – May", popularity: 94, tagline: "Neon nights & quiet shrines" },
  { id: "singapore", name: "Singapore", country: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80", budget: "₹80k – ₹1.4L", season: "Feb – Apr", popularity: 90, tagline: "Futuristic gardens & street food" },
  { id: "maldives", name: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80", budget: "₹1.5L – ₹3L", season: "Nov – Apr", popularity: 93, tagline: "Overwater villas & turquoise reefs" },
  { id: "switzerland", name: "Switzerland", country: "Switzerland", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80", budget: "₹2L – ₹3.5L", season: "Jun – Sep", popularity: 97, tagline: "Alpine peaks & glacier trains" },
];

export type DayPlan = {
  day: number;
  title: string;
  location: string;
  items: { time: string; title: string; desc: string; icon?: string }[];
};

export type TripPlan = {
  destination: string;
  duration: number;
  travelers: number;
  budgetTotal: number;
  style: string;
  summary: string;
  highlights: string[];
  weather: { day: string; high: number; low: number; cond: string }[];
  days: DayPlan[];
  budgetBreakdown: { name: string; value: number }[];
  costBars: { name: string; cost: number }[];
  activityMix: { name: string; value: number }[];
  hotels: { name: string; rating: number; price: string; area: string }[];
  transport: { mode: string; detail: string; cost: string }[];
};

export const sampleTrip: TripPlan = {
  destination: "Bali, Indonesia",
  duration: 7,
  travelers: 2,
  budgetTotal: 100000,
  style: "Beaches • Food • Nightlife • Photography",
  summary:
    "A balanced 7-day Bali escape blending Seminyak nightlife, Ubud culture, and Nusa Penida cliffs — designed for two travelers under ₹1 lakh.",
  highlights: [
    "Sunset at Tanah Lot temple",
    "Tegalalang rice terrace swing",
    "Kelingking cliff viewpoint",
    "Beach club day at Potato Head",
    "Ubud food walk & cooking class",
  ],
  weather: [
    { day: "Mon", high: 31, low: 24, cond: "Sunny" },
    { day: "Tue", high: 30, low: 24, cond: "Partly cloudy" },
    { day: "Wed", high: 29, low: 23, cond: "Showers" },
    { day: "Thu", high: 31, low: 24, cond: "Sunny" },
    { day: "Fri", high: 32, low: 25, cond: "Sunny" },
    { day: "Sat", high: 30, low: 24, cond: "Cloudy" },
    { day: "Sun", high: 31, low: 24, cond: "Sunny" },
  ],
  days: [
    {
      day: 1, title: "Arrival & Seminyak Sunset", location: "Seminyak",
      items: [
        { time: "14:00", title: "Check-in at boutique villa", desc: "Settle in, pool dip, fresh coconut" },
        { time: "17:30", title: "Double Six Beach walk", desc: "Golden-hour photography session" },
        { time: "20:00", title: "Dinner at La Brisa", desc: "Coastal Mediterranean with sea breeze" },
      ],
    },
    {
      day: 2, title: "Beach Club & Nightlife", location: "Canggu",
      items: [
        { time: "11:00", title: "Potato Head Beach Club", desc: "Daybed, infinity pool, DJ set" },
        { time: "19:00", title: "Old Man's", desc: "Casual beachfront eats" },
        { time: "22:00", title: "La Favela", desc: "Iconic Bali nightlife venue" },
      ],
    },
    {
      day: 3, title: "Ubud Culture Day", location: "Ubud",
      items: [
        { time: "09:00", title: "Tegalalang Rice Terrace", desc: "Jungle swing + drone shots" },
        { time: "13:00", title: "Balinese cooking class", desc: "Hands-on with a local chef" },
        { time: "18:00", title: "Sacred Monkey Forest", desc: "Twilight walk through ancient temples" },
      ],
    },
    {
      day: 4, title: "Nusa Penida Adventure", location: "Nusa Penida",
      items: [
        { time: "07:00", title: "Speedboat to Penida", desc: "45-min crossing from Sanur" },
        { time: "10:00", title: "Kelingking Beach viewpoint", desc: "T-Rex cliff — bucket-list shot" },
        { time: "15:00", title: "Angel's Billabong & Broken Beach", desc: "Natural infinity pools" },
      ],
    },
    {
      day: 5, title: "Uluwatu Cliffs", location: "Uluwatu",
      items: [
        { time: "10:00", title: "Padang Padang Beach", desc: "Hidden cove and surf watching" },
        { time: "17:30", title: "Uluwatu Temple", desc: "Cliffside temple at sunset" },
        { time: "19:00", title: "Kecak Fire Dance", desc: "Traditional performance" },
      ],
    },
    {
      day: 6, title: "Food & Wellness", location: "Seminyak",
      items: [
        { time: "09:00", title: "Sunrise yoga", desc: "Beachfront flow" },
        { time: "12:00", title: "Warung food tour", desc: "Nasi campur, babi guling, sate lilit" },
        { time: "20:00", title: "Mrs Sippy pool party", desc: "Sunset DJ session" },
      ],
    },
    {
      day: 7, title: "Tanah Lot & Departure", location: "Tanah Lot",
      items: [
        { time: "10:00", title: "Spa morning", desc: "Balinese massage" },
        { time: "16:00", title: "Tanah Lot temple", desc: "Iconic sea temple sunset" },
        { time: "22:00", title: "Departure", desc: "Transfer to Denpasar airport" },
      ],
    },
  ],
  budgetBreakdown: [
    { name: "Stay", value: 32000 },
    { name: "Food", value: 18000 },
    { name: "Transport", value: 22000 },
    { name: "Activities", value: 20000 },
    { name: "Misc", value: 8000 },
  ],
  costBars: [
    { name: "Day 1", cost: 9000 },
    { name: "Day 2", cost: 16000 },
    { name: "Day 3", cost: 13000 },
    { name: "Day 4", cost: 18000 },
    { name: "Day 5", cost: 12000 },
    { name: "Day 6", cost: 14000 },
    { name: "Day 7", cost: 18000 },
  ],
  activityMix: [
    { name: "Beach", value: 28 },
    { name: "Food", value: 24 },
    { name: "Culture", value: 18 },
    { name: "Nightlife", value: 16 },
    { name: "Photography", value: 14 },
  ],
  hotels: [
    { name: "The Layar Villas", rating: 4.8, price: "₹9,500 / night", area: "Seminyak" },
    { name: "Komaneka at Bisma", rating: 4.7, price: "₹11,200 / night", area: "Ubud" },
    { name: "Alila Uluwatu", rating: 4.9, price: "₹18,000 / night", area: "Uluwatu" },
  ],
  transport: [
    { mode: "Airport transfer", detail: "Private sedan, Denpasar → Seminyak", cost: "₹1,800" },
    { mode: "Scooter rental", detail: "Daily, ideal for Canggu & Ubud", cost: "₹500 / day" },
    { mode: "Penida day-trip", detail: "Speedboat + island driver", cost: "₹4,500 / pax" },
  ],
};

export const recentTrips = [
  { id: "1", name: "Tokyo Cherry Blossom", date: "Mar 2026", img: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80" },
  { id: "2", name: "Switzerland Alps", date: "Jul 2025", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80" },
  { id: "3", name: "Maldives Honeymoon", date: "Feb 2025", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80" },
];
