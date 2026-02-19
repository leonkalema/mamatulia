import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ImpactStatProps = {
  readonly value: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly className?: string;
};

export function ImpactStat({ value, label, icon: Icon, className }: ImpactStatProps) {
  return (
    <div className={cn("text-center", className)}>
      {Icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <p className="font-serif text-3xl font-normal text-foreground md:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
