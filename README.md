# WrapUP — AI Travel Planner

Plan beautiful, dynamic trips in seconds with an AI co-pilot powered by Groq
(`llama-3.3-70b-versatile`). WrapUP turns natural-language requests or
structured inputs into a full visual itinerary with charts, hotels, transport,
food, costs, and tips.

## Features

- 🧠 **Two planning modes** — Natural language chat or structured form
- ✨ **Real AI generation** via Groq (no hardcoded destinations)
- 📊 **Dynamic charts** — budget pie, daily costs, activity mix
- 🗂️ **Trip history** & ⭐ **Favorites** — saved in local storage
- 🎨 **Dark / Light themes** that affect the entire app
- ⚙️ **Settings panel** with live API status

## Tech Stack

- TanStack Start (React 19 + Vite 7)
- Tailwind CSS v4 (oklch design tokens, glassmorphism)
- Recharts • Framer Motion • Lucide icons
- Groq API for AI generation (server-side via `createServerFn`)

## Local Development

```bash
bun install
bun run dev
```

Open <http://localhost:8080>.

## Environment Variables

Configured via the Lovable secrets manager (or a local `.env`):

| Name | Purpose |
| ---- | ------- |
| `GROQ_API_KEY` | Server-side key for the Groq Chat Completions API |

The key is read inside `src/lib/trip-generator.functions.ts` and never exposed
to the browser.

## Project Structure

```
src/
├── routes/                # File-based routes (TanStack Router)
│   ├── __root.tsx
│   ├── index.tsx          # Dashboard
│   ├── planner.tsx        # Mode-select + Natural / Structured planning
│   ├── trip.tsx           # Generated itinerary view (charts, timeline, …)
│   ├── explore.tsx        # Curated destinations
│   ├── history.tsx        # Saved trip history (local storage)
│   ├── favorites.tsx      # Starred trips
│   └── settings.tsx       # API status + theme
├── lib/
│   ├── trip-generator.functions.ts  # Groq server function
│   ├── storage.ts                   # Local storage helpers
│   ├── trip-types.ts                # GeneratedTrip type
│   └── theme.tsx                    # Dark/Light theme provider
└── components/app-sidebar.tsx
```

## Push to GitHub

```bash
git init
git add .
git commit -m "WrapUP — Phase 2 (Groq integration, history, favorites)"
git branch -M main
git remote add origin https://github.com/kaustubh-d-IITR/WrapUP.git
git push -u origin main
```

> ⚠️ Make sure your real `GROQ_API_KEY` is **never committed**. Use Lovable
> secrets or a local `.env` that is gitignored.
