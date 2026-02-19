import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ProgramCardProps = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly stat?: string;
  readonly statLabel?: string;
  readonly icon?: LucideIcon;
  readonly imageUrl?: string | null;
  readonly color?: string;
  readonly className?: string;
};

export function ProgramCard({
  title,
  description,
  href,
  stat,
  statLabel,
  icon: Icon,
  imageUrl,
  color = "bg-[var(--brand-tan)]",
  className,
}: ProgramCardProps) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className={cn("relative aspect-[4/3] overflow-hidden rounded-xl", color)}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : Icon ? (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-16 w-16 text-white/40" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-5xl text-white/30">{title[0]}</span>
          </div>
        )}
        {stat && (
          <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-3 py-2 shadow-[var(--shadow-md)]">
            <p className="text-lg font-semibold text-foreground">{stat}</p>
            {statLabel && <p className="text-xs text-muted-foreground">{statLabel}</p>}
          </div>
        )}
      </div>
      <h3 className="mt-4 font-semibold transition-colors group-hover:text-primary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
        Learn More <ChevronRight className="ml-1 h-4 w-4" />
      </span>
    </Link>
  );
}
