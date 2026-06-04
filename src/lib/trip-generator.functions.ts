import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ValidatedTrip } from "./trip-schema";

export type AIStatus = "validated" | "retry_used" | "fallback_used";

const InputSchema = z.object({
  mode: z.enum(["natural", "structured"]),
  prompt: z.string().max(4000).optional(),
  destination: z.string().max(200).optional(),
  budget: z.number().int().min(0).max(100_000_000).optional(),
  duration: z.number().int().min(1).max(60).optional(),
  travelers: z.number().int().min(1).max(50).optional(),
  style: z.string().max(100).optional(),
  interests: z.string().max(500).optional(),
});

export const generateTrip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ValidatedTrip & { _ai_status: AIStatus }> => {
    // Proxy the request directly to our backend server
    const baseUrl = process.env.VITE_API_URL || "http://localhost:8787";
    const backendUrl = `${baseUrl.replace(/\/$/, '')}/generate-trip`;
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let msg = "Failed to generate trip from backend";
      try {
        const errJson = await res.json();
        msg = errJson.error || msg;
      } catch {
        // use default msg
      }
      throw new Error(msg);
    }

    return await res.json();
  });

export const checkGroqStatus = createServerFn({ method: "GET" }).handler(async () => {
  const baseUrl = process.env.VITE_API_URL || "http://localhost:8787";
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/status/groq`);
    return await res.json();
  } catch (e) {
    return { configured: true, ok: false, message: (e as Error).message };
  }
});

export const getGoogleMapsKey = createServerFn({ method: "GET" }).handler(async () => {
  const baseUrl = process.env.VITE_API_URL || "http://localhost:8787";
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api-key/maps`);
    return await res.json();
  } catch (e) {
    return { key: null };
  }
});

export const checkMapsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const baseUrl = process.env.VITE_API_URL || "http://localhost:8787";
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/status/maps`);
    return await res.json();
  } catch (e) {
    return { configured: true, ok: false, message: (e as Error).message };
  }
});
