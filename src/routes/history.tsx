import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History as HistoryIcon, Trash2, MapPin, Calendar, Users } from "lucide-react";
import { tripStorage } from "@/lib/storage";
import type { GeneratedTrip } from "@/lib/trip-types";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Trip History — WrapUP" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<GeneratedTrip[]>([]);

  useEffect(() => setItems(tripStorage.getHistory()), []);

  function open(t: GeneratedTrip) {
    tripStorage.setCurrent(t);
    navigate({ to: "/trip" });
  }
  function remove(id: string) {
    tripStorage.removeFromHistory(id);
    setItems(tripStorage.getHistory());
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <HistoryIcon className="h-3.5 w-3.5 text-brand" /> Trip history
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold">Your <span className="text-gradient-brand">past plans</span></h1>
      <p className="mt-3 text-muted-foreground">Every trip you generate is saved here automatically.</p>

      {items.length === 0 ? (
        <div className="mt-10 glass rounded-3xl p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4 text-brand">
            <HistoryIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-muted-foreground">Your future adventures will appear here.</p>
          <Link to="/planner" className="mt-6 inline-flex rounded-xl bg-gradient-brand px-6 py-3 text-sm font-medium text-background shadow-glow">
            Plan your first trip ✨
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.filter(t => t && t.id && typeof t === 'object').map((t) => {
            const heroImage = t.hotels?.[0]?.photoUrl || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
            const budgetVal = t.total_budget;
            const budgetStr = typeof budgetVal === 'number' ? budgetVal.toLocaleString() : (budgetVal || '0');
            const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent';
            const curr = t.currency || 'INR';

            return (
              <div key={t.id} className="glass rounded-3xl overflow-hidden flex flex-col hover:shadow-glow transition-all">
                <button onClick={() => open(t)} className="relative aspect-[16/9] w-full overflow-hidden block">
                  <img src={heroImage} alt={t.destination || 'Destination'} className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-left text-white">
                    <div className="text-2xl font-semibold">{t.destination || 'Unknown Trip'}</div>
                    <div className="text-xs opacity-90 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {dateStr}</div>
                  </div>
                </button>
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{t.trip_summary || 'No summary available.'}</p>
                  
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="glass rounded-full px-2 py-1 flex items-center gap-1 bg-muted/30"><Calendar className="h-3 w-3" />{t.duration || '?'}d</span>
                      <span className="glass rounded-full px-2 py-1 flex items-center gap-1 bg-muted/30"><Users className="h-3 w-3" />{t.travelers || '?'}</span>
                      <span className="glass rounded-full px-2 py-1 bg-muted/30">{curr} {budgetStr}</span>
                    </div>
                    <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
