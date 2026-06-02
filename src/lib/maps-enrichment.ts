import type { ValidatedTrip } from "./trip-schema";

export async function enrichTrip(trip: ValidatedTrip, apiKey: string): Promise<ValidatedTrip> {
  // If no API key, bypass enrichment
  if (!apiKey) return trip;

  const enrichedTrip = JSON.parse(JSON.stringify(trip)) as ValidatedTrip;
  
  // Helper to fetch place details
  async function searchPlace(query: string) {
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.priceLevel,places.regularOpeningHours,places.photos",
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 1,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.places || data.places.length === 0) return null;
      return data.places[0];
    } catch (e) {
      console.error("Maps API error:", e);
      return null;
    }
  }

  function getPhotoUrl(photoName: string) {
    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`;
  }

  // 1. Enrich Hotels
  if (enrichedTrip.hotels) {
    await Promise.all(
      enrichedTrip.hotels.map(async (hotel: any) => {
        const place = await searchPlace(`${hotel.name} in ${trip.destination}`);
        if (place) {
          hotel.placeId = place.id;
          if (place.location) hotel.coordinates = { lat: place.location.latitude, lng: place.location.longitude };
          if (place.formattedAddress) hotel.address = place.formattedAddress;
          if (place.rating) hotel.realRating = place.rating;
          if (place.userRatingCount) hotel.reviewsCount = place.userRatingCount;
          if (place.photos && place.photos.length > 0) {
            hotel.photoUrl = getPhotoUrl(place.photos[0].name);
          }
        }
      })
    );
  }

  // 2. Enrich Food
  if (enrichedTrip.food_recommendations) {
    await Promise.all(
      enrichedTrip.food_recommendations.map(async (food: any) => {
        const place = await searchPlace(`${food.name} in ${trip.destination}`);
        if (place) {
          food.placeId = place.id;
          if (place.location) food.coordinates = { lat: place.location.latitude, lng: place.location.longitude };
          if (place.rating) food.realRating = place.rating;
          if (place.priceLevel) food.priceLevel = place.priceLevel;
          if (place.regularOpeningHours?.openNow !== undefined) {
            food.openStatus = place.regularOpeningHours.openNow ? "Open Now" : "Closed";
          }
          if (place.photos && place.photos.length > 0) {
            food.photoUrl = getPhotoUrl(place.photos[0].name);
          }
        }
      })
    );
  }

  // 3. Enrich Daily Itinerary Items (Attractions)
  if (enrichedTrip.daily_itinerary) {
    await Promise.all(
      enrichedTrip.daily_itinerary.map(async (day: any) => {
        await Promise.all(
          day.items.map(async (item: any) => {
            // Avoid searching generic terms like "Lunch" or "Breakfast"
            const titleLower = item.title.toLowerCase();
            if (titleLower.includes("lunch") || titleLower.includes("breakfast") || titleLower.includes("dinner") || titleLower.includes("check-in") || titleLower.includes("departure")) {
              return;
            }
            
            const place = await searchPlace(`${item.title} in ${day.location || trip.destination}`);
            if (place) {
              item.placeId = place.id;
              if (place.location) item.coordinates = { lat: place.location.latitude, lng: place.location.longitude };
              if (place.photos && place.photos.length > 0) {
                item.photoUrl = getPhotoUrl(place.photos[0].name);
              }
            }
          })
        );
      })
    );
  }

  return enrichedTrip;
}
