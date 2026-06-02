import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "wrapup-backend" }));

app.post("/generate-trip", (req, res) => {
  const { destination = "Bali", duration = 7, travelers = 2, budget = 100000 } = req.body ?? {};
  res.json({
    destination,
    duration,
    travelers,
    budgetTotal: budget,
    summary: `Mock plan for ${destination} (${duration} days, ${travelers} travelers).`,
    days: Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      items: [{ time: "10:00", title: "Mock activity", desc: "Replace with Groq output later" }],
    })),
  });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`WrapUP backend on :${port}`));
