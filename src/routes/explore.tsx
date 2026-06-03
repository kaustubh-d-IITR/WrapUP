import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Compass } from "lucide-react";
import { useState, useEffect } from "react";

const ALL_DESTINATIONS = [
  { id: "1", name: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", popularity: 4.9, tagline: "Temples & Cherry Blossoms", budget: "₹1.5L - ₹2.5L", plannerBudget: 200000, season: "Spring", duration: 7, style: "Cultural", categories: ["Cultural", "Honeymoon"] },
  { id: "2", name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", popularity: 4.8, tagline: "Neon citylights", budget: "₹1.8L - ₹3L", plannerBudget: 220000, season: "Spring/Fall", duration: 7, style: "Balanced", categories: ["Cultural", "Family"] },
  { id: "3", name: "Osaka", country: "Japan", image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80", popularity: 4.7, tagline: "Food capital", budget: "₹1.2L - ₹2L", plannerBudget: 150000, season: "Spring/Fall", duration: 5, style: "Balanced", categories: ["Cultural", "Budget"] },
  { id: "4", name: "Zermatt", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80", popularity: 4.8, tagline: "Alpine wonder", budget: "₹2.5L - ₹4L", plannerBudget: 350000, season: "Winter", duration: 7, style: "Luxury", categories: ["Mountains", "Luxury", "Adventure"] },
  { id: "5", name: "Interlaken", country: "Switzerland", image: "https://images.unsplash.com/photo-1527668752968-14ce70a36e4b?w=800&q=80", popularity: 4.7, tagline: "Adventure hub", budget: "₹2.2L - ₹3.5L", plannerBudget: 300000, season: "Summer", duration: 5, style: "Adventure", categories: ["Mountains", "Adventure"] },
  { id: "6", name: "Lucerne", country: "Switzerland", image: "https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=800&q=80", popularity: 4.8, tagline: "Lakes & Mountains", budget: "₹2L - ₹3L", plannerBudget: 280000, season: "Summer/Fall", duration: 5, style: "Balanced", categories: ["Mountains", "Honeymoon"] },
  { id: "7", name: "Ubud", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", popularity: 4.7, tagline: "Spiritual retreat", budget: "₹60K - ₹1L", plannerBudget: 80000, season: "Summer", duration: 7, style: "Balanced", categories: ["Cultural", "Budget"] },
  { id: "8", name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80", popularity: 4.9, tagline: "Island of Gods", budget: "₹80K - ₹1.5L", plannerBudget: 120000, season: "Summer", duration: 7, style: "Beach", categories: ["Beach", "Honeymoon", "Adventure"] },
  { id: "9", name: "Jakarta", country: "Indonesia", image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&q=80", popularity: 4.2, tagline: "Urban metropolis", budget: "₹50K - ₹90K", plannerBudget: 70000, season: "Dry Season", duration: 4, style: "Balanced", categories: ["Budget"] },
  { id: "10", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80", popularity: 4.9, tagline: "City of Light", budget: "₹2L - ₹3.5L", plannerBudget: 250000, season: "Spring/Summer", duration: 6, style: "Luxury", categories: ["Cultural", "Honeymoon", "Luxury"] },
  { id: "11", name: "Nice", country: "France", image: "https://images.unsplash.com/photo-1533575770077-052fa2c609fc?w=800&q=80", popularity: 4.6, tagline: "French Riviera", budget: "₹2.2L - ₹4L", plannerBudget: 300000, season: "Summer", duration: 5, style: "Luxury", categories: ["Beach", "Luxury"] },
  { id: "12", name: "Lyon", country: "France", image: "https://images.unsplash.com/photo-1565881472855-322199b4494c?w=800&q=80", popularity: 4.5, tagline: "Gastronomy capital", budget: "₹1.5L - ₹2.5L", plannerBudget: 200000, season: "Fall", duration: 4, style: "Cultural", categories: ["Cultural", "Family"] },
  { id: "13", name: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", popularity: 4.8, tagline: "Sunset views", budget: "₹1.8L - ₹3L", plannerBudget: 200000, season: "Summer", duration: 5, style: "Honeymoon", categories: ["Beach", "Honeymoon"] },
  { id: "14", name: "Athens", country: "Greece", image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80", popularity: 4.6, tagline: "Cradle of civilization", budget: "₹1.2L - ₹2L", plannerBudget: 150000, season: "Spring/Fall", duration: 4, style: "Cultural", categories: ["Cultural", "Budget"] },
  { id: "15", name: "Mykonos", country: "Greece", image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800&q=80", popularity: 4.7, tagline: "Vibrant nightlife", budget: "₹2.5L - ₹4L", plannerBudget: 300000, season: "Summer", duration: 5, style: "Luxury", categories: ["Beach", "Luxury"] },
  { id: "16", name: "Machu Picchu", country: "Peru", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80", popularity: 4.9, tagline: "Ancient ruins", budget: "₹2L - ₹3L", plannerBudget: 250000, season: "Dry Season", duration: 6, style: "Adventure", categories: ["Mountains", "Adventure", "Cultural"] },
  { id: "17", name: "Cusco", country: "Peru", image: "https://images.unsplash.com/photo-1584282713702-86ee6c9d0092?w=800&q=80", popularity: 4.5, tagline: "Inca capital", budget: "₹1.5L - ₹2.5L", plannerBudget: 200000, season: "Dry Season", duration: 4, style: "Cultural", categories: ["Cultural", "Mountains"] },
  { id: "18", name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", popularity: 4.8, tagline: "Desert luxury", budget: "₹1.5L - ₹3.5L", plannerBudget: 250000, season: "Winter", duration: 5, style: "Luxury", categories: ["Luxury", "Family"] },
  { id: "19", name: "Singapore", country: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80", popularity: 4.9, tagline: "Garden city", budget: "₹1.2L - ₹2.5L", plannerBudget: 180000, season: "All Year", duration: 4, style: "Family", categories: ["Family", "Luxury"] },
  { id: "20", name: "Bangkok", country: "Thailand", image: "https://images.unsplash.com/photo-1508009603885-247a50f24b86?w=800&q=80", popularity: 4.7, tagline: "Street life", budget: "₹50K - ₹1L", plannerBudget: 75000, season: "Winter", duration: 5, style: "Budget", categories: ["Budget", "Cultural"] },
  { id: "21", name: "Phuket", country: "Thailand", image: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&q=80", popularity: 4.6, tagline: "Tropical beaches", budget: "₹60K - ₹1.2L", plannerBudget: 90000, season: "Winter", duration: 6, style: "Beach", categories: ["Beach", "Family", "Budget"] },
  { id: "22", name: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", popularity: 4.9, tagline: "Paradise islands", budget: "₹3L - ₹6L", plannerBudget: 400000, season: "Dry Season", duration: 5, style: "Honeymoon", categories: ["Beach", "Honeymoon", "Luxury"] },
  { id: "23", name: "Istanbul", country: "Turkey", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80", popularity: 4.8, tagline: "East meets West", budget: "₹1L - ₹1.8L", plannerBudget: 140000, season: "Spring/Fall", duration: 6, style: "Cultural", categories: ["Cultural", "Budget"] },
  { id: "24", name: "Cappadocia", country: "Turkey", image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80", popularity: 4.8, tagline: "Hot air balloons", budget: "₹1.2L - ₹2L", plannerBudget: 160000, season: "Spring/Fall", duration: 4, style: "Honeymoon", categories: ["Adventure", "Honeymoon"] },
  { id: "25", name: "Rome", country: "Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80", popularity: 4.9, tagline: "Eternal city", budget: "₹1.8L - ₹3L", plannerBudget: 220000, season: "Spring/Fall", duration: 5, style: "Cultural", categories: ["Cultural", "Family"] },
  { id: "26", name: "Venice", country: "Italy", image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&q=80", popularity: 4.7, tagline: "City of canals", budget: "₹2L - ₹3.5L", plannerBudget: 250000, season: "Spring/Fall", duration: 4, style: "Honeymoon", categories: ["Honeymoon", "Cultural"] },
  { id: "27", name: "Barcelona", country: "Spain", image: "https://images.unsplash.com/photo-1583422409516-15ec053e1d52?w=800&q=80", popularity: 4.8, tagline: "Gaudí's masterpiece", budget: "₹1.5L - ₹2.5L", plannerBudget: 180000, season: "Spring/Fall", duration: 6, style: "Cultural", categories: ["Cultural", "Beach"] },
  { id: "28", name: "Prague", country: "Czechia", image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80", popularity: 4.6, tagline: "City of a Hundred Spires", budget: "₹1.2L - ₹2L", plannerBudget: 150000, season: "Spring/Fall", duration: 4, style: "Cultural", categories: ["Cultural", "Budget"] },
  { id: "29", name: "Vienna", country: "Austria", image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80", popularity: 4.7, tagline: "Imperial capital", budget: "₹1.8L - ₹2.8L", plannerBudget: 200000, season: "Spring/Fall", duration: 4, style: "Cultural", categories: ["Cultural", "Luxury"] },
  { id: "30", name: "Budapest", country: "Hungary", image: "https://images.unsplash.com/photo-1549877452-9c3872542bf8?w=800&q=80", popularity: 4.7, tagline: "Thermal baths", budget: "₹1L - ₹1.8L", plannerBudget: 130000, season: "Spring/Fall", duration: 4, style: "Budget", categories: ["Cultural", "Budget"] },
  { id: "31", name: "Cape Town", country: "South Africa", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80", popularity: 4.7, tagline: "Mother City", budget: "₹1.5L - ₹2.5L", plannerBudget: 200000, season: "Summer", duration: 7, style: "Adventure", categories: ["Adventure", "Beach", "Mountains"] },
  { id: "32", name: "Queenstown", country: "New Zealand", image: "https://images.unsplash.com/photo-1589803157540-1087098e948c?w=800&q=80", popularity: 4.8, tagline: "Adrenaline capital", budget: "₹2.5L - ₹4L", plannerBudget: 300000, season: "Summer", duration: 7, style: "Adventure", categories: ["Adventure", "Mountains"] }
];

const FILTERS = ["All", "Luxury", "Budget", "Adventure", "Beach", "Mountains", "Cultural", "Family", "Honeymoon"];

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore — WrapUP" }] }),
  component: Explore,
});

// Helper to get 6 random unique items
function getRandomItems(array: typeof ALL_DESTINATIONS, num: number) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function Explore() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [displayed, setDisplayed] = useState<typeof ALL_DESTINATIONS>([]);

  // Randomize on mount and when filter changes
  useEffect(() => {
    let pool = ALL_DESTINATIONS;
    if (activeFilter !== "All") {
      pool = ALL_DESTINATIONS.filter(d => d.categories.includes(activeFilter));
    }
    setDisplayed(getRandomItems(pool, Math.min(6, pool.length)));
  }, [activeFilter]);

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Compass className="h-3.5 w-3.5 text-brand" /> Explore
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold">Find your next <span className="text-gradient-brand">obsession</span></h1>
      <p className="mt-3 text-muted-foreground max-w-xl">Hand-picked destinations curated by season, budget, and vibe.</p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === f 
                ? "bg-brand text-background shadow-glow" 
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {displayed.map((d, i) => (
            <motion.div 
              key={d.id + activeFilter} // force re-animation when array changes
              initial={{ opacity: 0, y: 14 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link 
                to="/planner" 
                search={{ 
                  destination: d.name, 
                  budget: d.plannerBudget.toString(), 
                  duration: d.duration.toString(), 
                  travelers: "2",
                  style: d.style,
                  autoGenerate: "true"
                }} 
                className="group block glass rounded-3xl overflow-hidden hover:shadow-glow transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
                  <img 
                    src={d.image} 
                    alt={d.name} 
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" 
                    onError={(e) => {
                      // Fallback image handling
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-xs text-white">
                    <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" /> {d.popularity}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-xs uppercase tracking-wider opacity-80">{d.country}</div>
                    <div className="text-2xl font-semibold">{d.name}</div>
                    <div className="text-xs opacity-90 mt-0.5">{d.tagline}</div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Estimated budget</div>
                    <div className="font-medium">{d.budget}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-xs">Best season</div>
                    <div className="font-medium">{d.season}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {displayed.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          No destinations found for this category.
        </div>
      )}
    </div>
  );
}
