import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ImpactStatProps = {
  readonly value: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly className?: string;
};

export function ImpactStat({ value, label, className }: ImpactStatProps) {
  return (
    <div className={cn("group", className)}>
      <div className="mb-4 h-px w-8 bg-[var(--brand-accent)]" />
      <p className="font-serif text-4xl font-light leading-none text-foreground md:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
