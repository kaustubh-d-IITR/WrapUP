import { generateFallbackTrip } from "./src/lib/trip-fallback.ts";
import { enrichTrip } from "./src/lib/maps-enrichment.ts";

async function runTests() {
  const tests = [
    { dest: "Japan", days: 7, budget: 200000 },
    { dest: "Switzerland", days: 7, budget: 500000 },
    { dest: "Italy", days: 7, budget: 300000 }
  ];

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  let passed = true;
  const report: string[] = ["# Final Local Testing Report\n"];

  for (const t of tests) {
    console.log(`Testing ${t.dest}...`);
    const fb = generateFallbackTrip({ destination: t.dest, duration: t.days, travelers: 2, budget: t.budget });
    const enriched = await enrichTrip(fb, apiKey);

    let hasHotels = enriched.hotels.length > 0;
    let hasFood = (enriched.food_recommendations?.length || 0) > 0;
    let hasActs = enriched.daily_itinerary.some((d: any) => d.items.length > 0);
    
    // Verify unique properties (e.g., budget)
    report.push(`## Test: ${t.dest}`);
    report.push(`- **Hotels Populated**: ${hasHotels ? "✅" : "❌"} (${enriched.hotels.length})`);
    report.push(`- **Restaurants Populated**: ${hasFood ? "✅" : "❌"} (${enriched.food_recommendations?.length || 0})`);
    report.push(`- **Attractions Populated**: ${hasActs ? "✅" : "❌"}`);
    report.push(`- **Total Budget**: ${enriched.total_budget}`);
    report.push(`- **Route Points (Lat/Lng)**: ${enriched.hotels[0]?.coordinates ? "✅" : "❌"}`);
    report.push("");
    
    if (!hasHotels || !hasFood || !hasActs) passed = false;
  }
  
  console.log(report.join("\n"));
  process.exit(passed ? 0 : 1);
}

runTests();
