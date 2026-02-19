import { cn } from "@/lib/utils";

type PullQuoteProps = {
  readonly quote: string;
  readonly author?: string;
  readonly className?: string;
};

export function PullQuote({ quote, author, className }: PullQuoteProps) {
  return (
    <blockquote
      className={cn(
        "relative border-l-4 border-primary bg-secondary py-6 pl-6 pr-4",
        className
      )}
    >
      <p className="font-serif text-lg italic leading-relaxed text-foreground/90 md:text-xl">
        &ldquo;{quote}&rdquo;
      </p>
      {author && (
        <footer className="mt-4 text-sm font-medium text-muted-foreground">
          — {author}
        </footer>
      )}
    </blockquote>
  );
}
