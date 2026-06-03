import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Filter, Star, Navigation } from "lucide-react";

const destinations = [
  { id: "1", name: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { id: "2", name: "Zermatt", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80" },
  { id: "3", name: "Ubud", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { id: "4", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e907a5ea071?w=800&q=80" },
  { id: "5", name: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80" },
  { id: "6", name: "Machu Picchu", country: "Peru", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80" }
];

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore — WrapUP" }] }),
  component: Explore,
});

function Explore() {
  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Compass className="h-3.5 w-3.5 text-brand" /> Explore
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold">Find your next <span className="text-gradient-brand">obsession</span></h1>
      <p className="mt-3 text-muted-foreground max-w-xl">Hand-picked destinations curated by season, budget, and vibe.</p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinations.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Link to="/trip" className="group block glass rounded-3xl overflow-hidden hover:shadow-glow transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
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
      </div>
    </div>
  );
}
