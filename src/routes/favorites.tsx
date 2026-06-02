import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Trash2, MapPin } from "lucide-react";
import { tripStorage } from "@/lib/storage";
import type { GeneratedTrip } from "@/lib/trip-types";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favorites — WrapUP" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<GeneratedTrip[]>([]);

  useEffect(() => setItems(tripStorage.getFavorites()), []);

  function open(t: GeneratedTrip) {
    tripStorage.setCurrent(t);
    navigate({ to: "/trip" });
  }
  function remove(id: string) {
    tripStorage.removeFavorite(id);
    setItems(tripStorage.getFavorites());
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Heart className="h-3.5 w-3.5 text-brand" /> Favorites
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold">Saved <span className="text-gradient-brand">trips</span></h1>
      <p className="mt-3 text-muted-foreground">Quickly access trips you love.</p>

      {items.length === 0 ? (
        <div className="mt-10 glass rounded-3xl p-10 text-center">
          <p className="text-muted-foreground">No favorites yet. Tap the heart icon on a trip to save it.</p>
          <Link to="/planner" className="mt-4 inline-flex rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-medium text-background shadow-glow">
            Plan a trip
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t.id} className="glass rounded-2xl p-5 flex flex-col gap-3 hover:shadow-glow transition-all">
              <div className="flex items-start justify-between gap-3">
                <button onClick={() => open(t)} className="text-left flex-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Saved {new Date(t.createdAt).toLocaleDateString()}</div>
                  <div className="mt-1 text-lg font-semibold">{t.destination}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.trip_summary}</p>
                </button>
                <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive p-2" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
