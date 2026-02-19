import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type StoryCardProps = {
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly date: string;
  readonly imageUrl: string | null;
  readonly authorName?: string;
  readonly variant?: "featured" | "compact" | "grid";
  readonly className?: string;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function StoryCard({
  title,
  slug,
  excerpt,
  date,
  imageUrl,
  authorName,
  variant = "grid",
  className,
}: StoryCardProps) {
  if (variant === "featured") {
    return (
      <Link href={`/news/${slug}`} className={cn("group block", className)}>
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[var(--brand-tan)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-6xl text-white/30">{title[0]}</span>
            </div>
          )}
        </div>
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {formatDate(date)}
            {authorName && <span> · {authorName}</span>}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-normal leading-tight md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 line-clamp-2 text-muted-foreground">{excerpt}</p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-primary transition-colors group-hover:text-[var(--brand-orange-dark)]">
            Read Her Story <ChevronRight className="ml-1 h-4 w-4" />
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/news/${slug}`} className={cn("group flex gap-4", className)}>
        <div className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--brand-earth)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-[var(--duration-fast)] group-hover:scale-105"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-xl text-white/30">{title[0]}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
          <h3 className="mt-1 line-clamp-2 font-medium leading-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${slug}`} className={cn("group block", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--brand-tan)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-4xl text-white/30">{title[0]}</span>
          </div>
        )}
      </div>
      <h3 className="mt-4 font-medium leading-tight transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
        Read More <ChevronRight className="ml-1 h-4 w-4" />
      </span>
    </Link>
  );
}
