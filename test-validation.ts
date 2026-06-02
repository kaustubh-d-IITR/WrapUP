import { generateFallbackTrip } from "./src/lib/trip-fallback.ts";
import { validateTripResponse } from "./src/lib/trip-schema.ts";

const destinations = ["Paris", "Japan", "Switzerland", "India", "Bali", "Dubai"];
const report: string[] = ["# Validation Test Report\n"];

for (const dest of destinations) {
  const trip = generateFallbackTrip({ destination: dest, duration: 5, travelers: 2, budget: 100000 });
  const validation = validateTripResponse(trip);
  
  if (validation.ok) {
    report.push(`✅ **${dest}**: Validation Passed (Fallback Generated successfully)`);
  } else {
    report.push(`❌ **${dest}**: Validation Failed`);
    for (const err of validation.errors) {
      report.push(`  - [${err.path}]: ${err.message}`);
    }
  }
}

console.log(report.join("\n"));
