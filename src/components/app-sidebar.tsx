import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, Compass, MapPinned, Moon, Sun, Plane, History, Heart, Settings } from "lucide-react";
import { useTheme } from "@/lib/theme";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "AI Planner", url: "/planner", icon: Sparkles },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Trip Details", url: "/trip", icon: MapPinned },
  { title: "History", url: "/history", icon: History },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
          <Plane className="h-5 w-5 text-background" />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">WrapUP</div>
          <div className="text-xs text-muted-foreground -mt-0.5">AI Travel Planner</div>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="px-3 pb-2 pt-4 text-xs uppercase tracking-wider text-muted-foreground">Workspace</div>
        <ul className="space-y-1">
          {items.map((it) => {
            const active = it.url === "/" ? pathname === "/" : pathname.startsWith(it.url);
            return (
              <li key={it.url}>
                <Link
                  to={it.url}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
                    ${active
                      ? "bg-gradient-brand text-background shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                >
                  <it.icon className="h-4 w-4" />
                  <span className="font-medium">{it.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-xl glass px-3 py-2.5 text-sm hover:shadow-glow transition-all"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "dark" ? "Dark" : "Light"} mode
          </span>
          <span className="text-xs text-muted-foreground">toggle</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const mobileItems = items.slice(0, 5);
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass rounded-2xl px-2 py-2 flex justify-around">
      {mobileItems.map((it) => {
        const active = it.url === "/" ? pathname === "/" : pathname.startsWith(it.url);
        return (
          <Link key={it.url} to={it.url} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] ${active ? "bg-gradient-brand text-background" : "text-muted-foreground"}`}>
            <it.icon className="h-4 w-4" />
            {it.title.split(" ")[0]}
          </Link>
        );
      })}
    </nav>
  );
}
