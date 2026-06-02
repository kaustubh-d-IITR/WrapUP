/// <reference types="@types/google.maps" />
import React, { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, Bed, Utensils, Star, Route as RouteIcon, Info } from "lucide-react";
import type { GeneratedTrip } from "@/lib/trip-types";

// ── Fallback Map Component ─────────────────────────────────────────

export function TripMapFallback() {
  return (
    <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[500px] border border-border">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <MapPin className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold">Map Unavailable</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">
        The interactive map requires a valid Google Maps API Key. Please add it to your environment variables.
      </p>
    </div>
  );
}

// ── Directions Service Hook ────────────────────────────────────────

function DirectionsRenderer({ trip }: { trip: GeneratedTrip }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [directionsSvc, setDirectionsSvc] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    setDirectionsSvc(new routesLib.DirectionsService());
    setDirectionsRenderer(new routesLib.DirectionsRenderer({ map, suppressMarkers: true }));
  }, [routesLib, map]);

  useEffect(() => {
    if (!directionsSvc || !directionsRenderer) return;

    // Collect all coordinates in order of itinerary
    const points: { lat: number; lng: number }[] = [];
    trip.daily_itinerary.forEach(day => {
      day.items.forEach(item => {
        if (item.coordinates) points.push(item.coordinates);
      });
    });

    if (points.length < 2) return;

    const origin = points[0];
    const destination = points[points.length - 1];
    const waypoints = points.slice(1, points.length - 1).map(p => ({ location: p, stopover: true }));

    // Directions API has a limit of 25 waypoints
    const safeWaypoints = waypoints.slice(0, 25);

    directionsSvc
      .route({
        origin,
        destination,
        waypoints: safeWaypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      })
      .then((res: google.maps.DirectionsResult) => {
        directionsRenderer.setDirections(res);
        if (res.routes[0] && res.routes[0].legs) {
          let dist = 0;
          let time = 0;
          res.routes[0].legs.forEach((leg: google.maps.DirectionsLeg) => {
            dist += leg.distance?.value || 0;
            time += leg.duration?.value || 0;
          });
          setRouteInfo({
            distance: (dist / 1000).toFixed(1) + " km",
            duration: Math.round(time / 60) + " mins",
          });
        }
      })
      .catch((e: Error) => {
        console.error("Directions request failed", e);
      });

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [directionsSvc, directionsRenderer, trip]);

  if (!routeInfo) return null;

  return (
    <div className="absolute top-4 left-4 z-10 glass rounded-xl px-4 py-3 shadow-lg flex items-center gap-4 text-sm font-medium">
      <div className="flex items-center gap-1.5"><RouteIcon className="h-4 w-4 text-brand" /> {routeInfo.distance}</div>
      <div className="flex items-center gap-1.5 text-muted-foreground">{routeInfo.duration}</div>
    </div>
  );
}

// ── Main Map Component ─────────────────────────────────────────────

export function TripMap({ trip, mapsKey }: { trip: GeneratedTrip; mapsKey?: string | null }) {
  if (!mapsKey) return <TripMapFallback />;

  // Collect all valid markers
  type MarkerData = { id: string; type: "hotel" | "food" | "activity"; title: string; lat: number; lng: number; photoUrl?: string; rating?: number };
  const markers: MarkerData[] = [];

  trip.hotels.forEach((h, i) => {
    if (h.coordinates) markers.push({ id: `hotel-${i}`, type: "hotel", title: h.name, lat: h.coordinates.lat, lng: h.coordinates.lng, photoUrl: h.photoUrl, rating: h.realRating || h.rating });
  });
  (trip.food_recommendations || []).forEach((f, i) => {
    if (f.coordinates) markers.push({ id: `food-${i}`, type: "food", title: f.name, lat: f.coordinates.lat, lng: f.coordinates.lng, photoUrl: f.photoUrl, rating: f.realRating });
  });
  trip.daily_itinerary.forEach((d, di) => {
    d.items.forEach((it, i) => {
      if (it.coordinates) markers.push({ id: `act-${di}-${i}`, type: "activity", title: it.title, lat: it.coordinates.lat, lng: it.coordinates.lng, photoUrl: it.photoUrl });
    });
  });

  const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);

  // Auto-center bounds
  const center = markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 0, lng: 0 };

  return (
    <APIProvider apiKey={mapsKey}>
      <div className="h-[500px] w-full rounded-2xl overflow-hidden relative border border-border shadow-md">
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId="wrapup-trip-map"
          disableDefaultUI
          gestureHandling="greedy"
        >
          {markers.map(m => (
            <AdvancedMarker
              key={m.id}
              position={{ lat: m.lat, lng: m.lng }}
              onClick={() => setOpenMarkerId(m.id)}
            >
              <div className={`flex items-center justify-center h-8 w-8 rounded-full shadow-lg border-2 border-background text-white ${
                m.type === "hotel" ? "bg-emerald-500" :
                m.type === "food" ? "bg-orange-500" : "bg-brand"
              }`}>
                {m.type === "hotel" ? <Bed className="h-4 w-4" /> :
                 m.type === "food" ? <Utensils className="h-4 w-4" /> :
                 <Star className="h-4 w-4" />}
              </div>
            </AdvancedMarker>
          ))}

          {markers.map(m => openMarkerId === m.id && (
            <InfoWindow
              key={`info-${m.id}`}
              position={{ lat: m.lat, lng: m.lng }}
              onCloseClick={() => setOpenMarkerId(null)}
              headerContent={m.title}
            >
              <div className="p-1 max-w-[200px]">
                {m.photoUrl && <img src={m.photoUrl} alt={m.title} className="w-full h-24 object-cover rounded-md mb-2" />}
                <p className="font-semibold text-sm text-foreground">{m.title}</p>
                {m.rating && <p className="text-xs text-muted-foreground mt-0.5">⭐ {m.rating}</p>}
              </div>
            </InfoWindow>
          ))}

          <DirectionsRenderer trip={trip} />
        </Map>
      </div>
    </APIProvider>
  );
}
