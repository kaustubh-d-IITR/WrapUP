import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bed, MapPin, Route as RouteIcon, Star, Utensils } from "lucide-react";
import type { GeneratedTrip } from "@/lib/trip-types";
import { useTheme } from "@/lib/theme";

type MarkerData = {
  id: string;
  type: "hotel" | "food" | "activity";
  title: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  rating?: number;
};

const PIN_COLOR = {
  hotel: "#10b981",
  food: "#f97316",
  activity: "#00D4FF",
};

function pinIcon(type: MarkerData["type"]) {
  const glyph = type === "hotel" ? "H" : type === "food" ? "F" : "A";
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:999px;background:${PIN_COLOR[type]};color:#041018;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.35)">${glyph}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FitToPoints({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

function collectMarkers(trip: GeneratedTrip): MarkerData[] {
  const markers: MarkerData[] = [];
  trip.hotels.forEach((hotel, index) => {
    if (!hotel.coordinates) return;
    markers.push({
      id: `hotel-${index}`,
      type: "hotel",
      title: hotel.name,
      lat: hotel.coordinates.lat,
      lng: hotel.coordinates.lng,
      photoUrl: hotel.photoUrl,
      rating: hotel.realRating || hotel.rating,
    });
  });
  (trip.food_recommendations || []).forEach((food, index) => {
    if (!food.coordinates) return;
    markers.push({
      id: `food-${index}`,
      type: "food",
      title: food.name,
      lat: food.coordinates.lat,
      lng: food.coordinates.lng,
      photoUrl: food.photoUrl,
      rating: food.realRating,
    });
  });
  trip.daily_itinerary.forEach((day, dayIndex) => {
    day.items.forEach((item, itemIndex) => {
      if (!item.coordinates) return;
      markers.push({
        id: `act-${dayIndex}-${itemIndex}`,
        type: "activity",
        title: item.title,
        lat: item.coordinates.lat,
        lng: item.coordinates.lng,
        photoUrl: item.photoUrl,
      });
    });
  });
  return markers;
}

export function TripMap({ trip }: { trip: GeneratedTrip }) {
  const { theme } = useTheme();
  const markers = useMemo(() => collectMarkers(trip), [trip]);
  const points = useMemo<[number, number][]>(() => markers.map((marker) => [marker.lat, marker.lng]), [markers]);
  const routePoints = useMemo<[number, number][]>(() => {
    const ordered: [number, number][] = [];
    trip.daily_itinerary.forEach((day) => {
      day.items.forEach((item) => {
        if (item.coordinates) ordered.push([item.coordinates.lat, item.coordinates.lng]);
      });
    });
    return ordered.slice(0, 25);
  }, [trip]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (routePoints.length < 2) {
      setRoute([]);
      setRouteInfo(null);
      return;
    }
    const path = routePoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
    let cancelled = false;
    fetch(`https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const leg = data.routes?.[0];
        if (!leg?.geometry?.coordinates) return;
        setRoute(leg.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]));
        setRouteInfo({
          distance: (leg.distance / 1000).toFixed(1) + " km",
          duration: Math.round(leg.duration / 60) + " mins",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setRoute([]);
          setRouteInfo(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [routePoints]);

  const center = points[0] || [20.5937, 78.9629];
  const tiles = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className={`h-[500px] w-full rounded-2xl overflow-hidden relative border border-border shadow-md ${theme === "dark" ? "map-tiles-dark" : ""}`}>
      <style>{`.map-tiles-dark .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.95); }`}</style>
      <MapContainer center={center} zoom={points.length ? 12 : 4} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer key={tiles} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={tiles} />
        <FitToPoints points={points} />
        {route.length > 1 && <Polyline positions={route} pathOptions={{ color: "#00D4FF", weight: 4, opacity: 0.9 }} />}
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={pinIcon(marker.type)}>
            <Popup>
              <div className="max-w-[200px]">
                {marker.photoUrl && <img src={marker.photoUrl} alt={marker.title} className="mb-2 h-24 w-full rounded-md object-cover" />}
                <div className="text-sm font-semibold">{marker.title}</div>
                {marker.rating ? <div className="mt-0.5 text-xs text-neutral-600">⭐ {marker.rating}</div> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {routeInfo && (
        <div className="absolute top-4 left-4 z-[500] glass rounded-xl px-4 py-3 shadow-lg flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5"><RouteIcon className="h-4 w-4 text-brand" /> {routeInfo.distance}</div>
          <div className="flex items-center gap-1.5 text-muted-foreground">{routeInfo.duration}</div>
        </div>
      )}

      {markers.length === 0 && (
        <div className="absolute top-4 left-4 z-[500] max-w-sm glass rounded-xl px-4 py-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>Generate a new trip to drop stops on the map. Trips saved before this update have no coordinates.</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-[500] glass rounded-xl px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
        <Bed className="h-3 w-3 text-emerald-400" /> Hotel
        <Utensils className="h-3 w-3 text-orange-400" /> Food
        <Star className="h-3 w-3 text-brand" /> Stop
      </div>
    </div>
  );
}
