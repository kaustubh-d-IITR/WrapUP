import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Settings as SettingsIcon, CheckCircle2, XCircle, Loader2, Moon, Sun } from "lucide-react";
import { checkGroqStatus, checkMapsStatus } from "@/lib/trip-generator.functions";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — WrapUP" }] }),
  component: SettingsPage,
});

type Status = "loading" | "connected" | "disconnected" | "error";

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const callGroqStatus = useServerFn(checkGroqStatus);
  const callMapsStatus = useServerFn(checkMapsStatus);
  const [groq, setGroq] = useState<Status>("loading");
  const [groqDetail, setGroqDetail] = useState<string>("Checking…");
  const [maps, setMaps] = useState<Status>("loading");
  const [mapsDetail, setMapsDetail] = useState<string>("Checking…");

  useEffect(() => {
    (async () => {
      try {
        const s = await callGroqStatus();
        if (!s.configured) {
          setGroq("disconnected");
          setGroqDetail("GROQ_API_KEY not configured");
        } else if (s.ok) {
          setGroq("connected");
          setGroqDetail("Live • llama-3.3-70b-versatile");
        } else {
          setGroq("error");
          setGroqDetail(`HTTP ${s.status ?? "error"}`);
        }
      } catch (e) {
        setGroq("error");
        setGroqDetail((e as Error).message);
      }

      try {
        const m = await callMapsStatus();
        if (!m.configured) {
          setMaps("disconnected");
          setMapsDetail("GOOGLE_MAPS_API_KEY missing");
        } else if (m.ok) {
          setMaps("connected");
          setMapsDetail("Configured & Ready");
        } else {
          setMaps("error");
          setMapsDetail("Invalid Key Format");
        }
      } catch (e) {
        setMaps("error");
        setMapsDetail((e as Error).message);
      }
    })();
  }, []);

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <SettingsIcon className="h-3.5 w-3.5 text-brand" /> Settings
      </div>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold">App <span className="text-gradient-brand">status</span></h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard label="Groq API" status={groq} detail={groqDetail} />
        <StatusCard label="Backend" status="connected" detail="TanStack Start server" />
        <StatusCard label="Environment" status="connected" detail="Secrets loaded" />
        <StatusCard
          label="Google Maps"
          status={maps}
          detail={mapsDetail}
        />
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-1">Switch between dark and light themes.</p>
        <div className="mt-4 inline-flex rounded-xl border border-border p-1">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${theme === "light" ? "bg-gradient-brand text-background" : ""}`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${theme === "dark" ? "bg-gradient-brand text-background" : ""}`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, status, detail }: { label: string; status: Status; detail: string }) {
  const icon =
    status === "loading" ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> :
    status === "connected" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> :
    status === "error" ? <XCircle className="h-5 w-5 text-destructive" /> :
    <XCircle className="h-5 w-5 text-muted-foreground" />;

  const text =
    status === "loading" ? "Checking" :
    status === "connected" ? "Connected" :
    status === "error" ? "Error" :
    "Disconnected";

  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{text} • {detail}</div>
      </div>
    </div>
  );
}
