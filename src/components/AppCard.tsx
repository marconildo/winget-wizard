import { useState } from "react";
import type { SetupApp } from "@/data/apps";
import { categoryLabels } from "@/data/apps";
import { Checkbox } from "@/components/ui/checkbox";
import { PackageDetailsModal } from "@/components/PackageDetailsModal";
import { cn } from "@/lib/utils";
import { Globe, Code, Wrench, MessageCircle, Play, Ban, Info, Gamepad2 } from "lucide-react";

const catIcons = {
  browsers: Globe,
  development: Code,
  utilities: Wrench,
  communication: MessageCircle,
  multimedia: Play,
  games: Gamepad2,
};

const catColors: Record<string, string> = {
  browsers: "bg-palette-cyan/15 text-palette-cyan",
  development: "bg-palette-aqua/15 text-palette-aqua",
  utilities: "bg-palette-orange/15 text-palette-orange",
  communication: "bg-emerald-500/15 text-emerald-600",
  multimedia: "bg-rose-500/15 text-rose-600",
  games: "bg-purple-500/15 text-purple-600",
};

interface Props {
  app: SetupApp;
  selected: boolean;
  available: boolean;
  packageName?: string;
  onToggle: (id: string) => void;
}

export function AppCard({ app, selected, available, packageName, onToggle }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const Icon = catIcons[app.category];
  const iconColor = catColors[app.category] ?? "bg-muted text-muted-foreground";

  return (
    <>
      <button
        onClick={() => onToggle(app.id)}
        disabled={!available}
        className={cn(
          "group relative flex items-start gap-3 p-4 rounded-xl border text-left w-full",
          "transition-all duration-200 ease-out",
          available && "hover:-translate-y-0.5 hover:shadow-md",
          !available && "opacity-70 cursor-not-allowed border-dashed",
          selected
            ? "bg-palette-cyan/10 border-palette-cyan shadow-sm ring-1 ring-palette-aqua/40"
            : "bg-white border-border hover:border-palette-cyan/50 hover:shadow-sm"
        )}
      >
        <div className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          selected
            ? "bg-palette-cyan text-white shadow-sm shadow-palette-cyan/30"
            : cn(iconColor, "group-hover:scale-105")
        )}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm truncate leading-tight mb-0.5",
            selected ? "text-palette-cyan font-bold" : "text-foreground font-semibold"
          )}>
            {app.name}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono truncate leading-tight">{packageName ?? app.id}</p>
          {app.description && (
            <p className="text-[11px] text-muted-foreground/70 truncate leading-tight mt-0.5">{app.description}</p>
          )}
          <span className={cn(
            "inline-block mt-1.5 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full",
            selected ? "bg-palette-cyan/20 text-palette-cyan" : "bg-muted text-muted-foreground"
          )}>
            {categoryLabels[app.category]}
          </span>
          {!available && (
            <p className="mt-1.5 text-[11px] text-palette-orange bg-palette-orange/15 border border-palette-orange/25 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium">
              <Ban className="h-3 w-3" />
              Não disponível para este sistema
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <Checkbox
            checked={selected}
            className={cn(
              "mt-1 pointer-events-none transition-all duration-200",
              selected ? "data-[state=checked]:bg-palette-cyan data-[state=checked]:border-palette-cyan" : ""
            )}
          />
          <button
            type="button"
            aria-label={`Ver detalhes de ${app.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setDetailsOpen(true);
            }}
            className={cn(
              "pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full transition-colors",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "hover:bg-palette-cyan/15 hover:text-palette-cyan text-muted-foreground/60"
            )}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </button>

      <PackageDetailsModal
        app={app}
        open={detailsOpen}
        selected={selected}
        onClose={() => setDetailsOpen(false)}
        onToggle={onToggle}
      />
    </>
  );
}
