import { Globe, Code, Wrench, MessageCircle, Play, Layers, Gamepad2 } from "lucide-react";
import type { AppCategory } from "@/data/apps";
import { categoryLabels } from "@/data/apps";
import { cn } from "@/lib/utils";

const icons: Record<AppCategory | "all", React.ReactNode> = {
  all: <Layers className="h-4 w-4" />,
  browsers: <Globe className="h-4 w-4" />,
  development: <Code className="h-4 w-4" />,
  utilities: <Wrench className="h-4 w-4" />,
  communication: <MessageCircle className="h-4 w-4" />,
  multimedia: <Play className="h-4 w-4" />,
  games: <Gamepad2 className="h-4 w-4" />,
};

const categories: (AppCategory | "all")[] = ["all", "browsers", "development", "utilities", "communication", "multimedia", "games"];

interface Props {
  active: AppCategory | "all";
  onSelect: (cat: AppCategory | "all") => void;
  counts: Record<string, number>;
}

export function CategorySidebar({ active, onSelect, counts }: Props) {
  return (
    <nav className="space-y-0.5">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            active === cat
              ? "bg-palette-mahogany/90 text-white shadow-sm border-l-2 border-palette-aqua"
              : "text-sidebar-foreground/80 hover:bg-palette-mahogany/40 hover:text-white"
          )}
        >
          <span className={cn(
            "flex items-center justify-center h-6 w-6 rounded-md transition-colors",
            active === cat ? "bg-palette-cyan/20 text-palette-aqua" : "text-sidebar-foreground/60"
          )}>
            {icons[cat]}
          </span>
          <span className="flex-1 text-left">{cat === "all" ? "Todos" : categoryLabels[cat]}</span>
          <span className={cn(
            "text-[11px] font-semibold px-1.5 py-0.5 rounded-md min-w-[22px] text-center transition-colors",
            active === cat
              ? "bg-palette-orange/20 text-palette-orange border border-palette-orange/40 font-bold"
              : "bg-palette-mahogany/50 text-sidebar-foreground/60"
          )}>
            {counts[cat] || 0}
          </span>
        </button>
      ))}
    </nav>
  );
}
