import type { GeneratedTrip } from "./trip-types";

const HISTORY_KEY = "wrapup-history";
const FAVORITES_KEY = "wrapup-favorites";
const CURRENT_KEY = "wrapup-current-trip";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    console.warn("Storage write failed", e);
    // If QuotaExceededError and it's the history array, try to store fewer items
    if (e.name === "QuotaExceededError" && key === "wrapup-history" && Array.isArray(value) && value.length > 5) {
      console.log("Truncating history due to quota limit");
      write(key, value.slice(0, 5));
    }
  }
}

export const tripStorage = {
  getHistory: () => read<GeneratedTrip[]>(HISTORY_KEY, []),
  addToHistory: (trip: GeneratedTrip) => {
    const list = tripStorage.getHistory().filter((t) => t.id !== trip.id);
    list.unshift(trip);
    write(HISTORY_KEY, list.slice(0, 50));
  },
  removeFromHistory: (id: string) => {
    write(HISTORY_KEY, tripStorage.getHistory().filter((t) => t.id !== id));
  },
  getFavorites: () => read<GeneratedTrip[]>(FAVORITES_KEY, []),
  isFavorite: (id: string) => tripStorage.getFavorites().some((t) => t.id === id),
  toggleFavorite: (trip: GeneratedTrip) => {
    const favs = tripStorage.getFavorites();
    const exists = favs.some((t) => t.id === trip.id);
    const next = exists ? favs.filter((t) => t.id !== trip.id) : [trip, ...favs];
    write(FAVORITES_KEY, next);
    return !exists;
  },
  removeFavorite: (id: string) => {
    write(FAVORITES_KEY, tripStorage.getFavorites().filter((t) => t.id !== id));
  },
  setCurrent: (trip: GeneratedTrip) => write(CURRENT_KEY, trip),
  getCurrent: (): GeneratedTrip | null => read<GeneratedTrip | null>(CURRENT_KEY, null),
  getById: (id: string): GeneratedTrip | null => {
    const cur = tripStorage.getCurrent();
    if (cur?.id === id) return cur;
    return (
      tripStorage.getHistory().find((t) => t.id === id) ||
      tripStorage.getFavorites().find((t) => t.id === id) ||
      null
    );
  },
};
