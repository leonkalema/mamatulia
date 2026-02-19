import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTABannerProps = {
  readonly title: string;
  readonly description: string;
  readonly primaryButton: {
    readonly text: string;
    readonly href: string;
    readonly external?: boolean;
  };
  readonly secondaryButton?: {
    readonly text: string;
    readonly href: string;
  };
  readonly variant?: "warm" | "neutral";
  readonly className?: string;
};

export function CTABanner({
  title,
  description,
  primaryButton,
  secondaryButton,
  variant = "warm",
  className,
}: CTABannerProps) {
  const isWarm = variant === "warm";

  return (
    <section
      className={cn(
        "py-16 md:py-20",
        isWarm ? "bg-[var(--brand-earth)]" : "bg-secondary",
        className
      )}
    >
      <div className="container mx-auto px-4 text-center">
        <h2
          className={cn(
            "font-serif text-2xl font-normal md:text-3xl",
            isWarm ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "mx-auto mt-3 max-w-lg",
            isWarm ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {primaryButton.external ? (
            <Button
              asChild
              size="lg"
              className={cn(
                "rounded-full px-8",
                isWarm && "bg-white text-foreground hover:bg-white/90"
              )}
            >
              <a href={primaryButton.href} target="_blank" rel="noopener noreferrer">
                {primaryButton.text}
              </a>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className={cn(
                "rounded-full px-8",
                isWarm && "bg-white text-foreground hover:bg-white/90"
              )}
            >
              <Link href={primaryButton.href}>{primaryButton.text}</Link>
            </Button>
          )}
          {secondaryButton && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(
                "rounded-full px-8",
                isWarm && "border-white/50 bg-white/10 text-white hover:bg-white hover:text-foreground"
              )}
            >
              <Link href={secondaryButton.href}>{secondaryButton.text}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
