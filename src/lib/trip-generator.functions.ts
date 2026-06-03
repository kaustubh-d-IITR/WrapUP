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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { configured: false, ok: false, message: "GROQ_API_KEY missing" };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { configured: true, ok: res.ok, status: res.status };
  } catch (e) {
    return { configured: true, ok: false, message: (e as Error).message };
  }
});

export const getGoogleMapsKey = createServerFn({ method: "GET" }).handler(async () => {
  return { key: process.env.GOOGLE_MAPS_API_KEY || null };
});

export const checkMapsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { configured: false, ok: false, message: "GOOGLE_MAPS_API_KEY missing" };
  const isLikelyValid = apiKey.startsWith("AIza");
  return { configured: true, ok: isLikelyValid, status: isLikelyValid ? 200 : 400 };
});
