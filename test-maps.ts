import { generateFallbackTrip } from "./src/lib/trip-fallback.ts";
import { enrichTrip } from "./src/lib/maps-enrichment.ts";

const destinations = ["Japan", "India", "Paris", "Dubai", "Switzerland"];
const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";

async function runTests() {
  console.log("Starting Maps Enrichment Tests...");
  console.log(`Using API Key: ${apiKey.substring(0, 8)}...`);

  const report: string[] = ["# Google Maps Enrichment Test Report\n"];

  for (const dest of destinations) {
    console.log(`Testing ${dest}...`);
    const fbTrip = generateFallbackTrip({ destination: dest, duration: 5, travelers: 2, budget: 10000 });
    
    // Enrich
    const start = Date.now();
    const enriched = await enrichTrip(fbTrip, apiKey);
    const duration = Date.now() - start;

    // Verify enrichment
    let hotelsEnriched = 0;
    enriched.hotels.forEach((h: any) => { if (h.placeId) hotelsEnriched++; });

    let foodEnriched = 0;
    (enriched.food_recommendations || []).forEach((f: any) => { if (f.placeId) foodEnriched++; });

    let actEnriched = 0;
    enriched.daily_itinerary.forEach((d: any) => {
      d.items.forEach((it: any) => {
        if (it.placeId) actEnriched++;
      });
    });

    report.push(`## ${dest} Trip`);
    report.push(`- **Enrichment Time**: ${duration}ms`);
    report.push(`- **Hotels Enriched**: ${hotelsEnriched}/${enriched.hotels.length}`);
    report.push(`- **Restaurants Enriched**: ${foodEnriched}/${enriched.food_recommendations?.length || 0}`);
    
    const totalActs = enriched.daily_itinerary.reduce((acc: number, d: any) => acc + d.items.length, 0);
    report.push(`- **Attractions Enriched**: ${actEnriched}/${totalActs}`);
    report.push("");
  }

  console.log("\n" + report.join("\n"));
}

runTests();
