import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
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
  icon: Icon,
  imageUrl,
  color = "bg-[var(--brand-ink-soft)]",
  className,
}: ProgramCardProps) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className={cn("relative aspect-[3/4] overflow-hidden", color)}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-[500ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : Icon ? (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-16 w-16 text-white/20" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-7xl text-white/15">{title[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-serif text-xl font-light leading-tight text-white">
            {title}
          </h3>
          <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-white/80 transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:max-h-24">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
