import Link from "next/link";
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
        "py-20 md:py-28",
        isWarm ? "bg-[var(--brand-ink)]" : "bg-[var(--brand-surface)]",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <h2
            className={cn(
              "font-serif text-3xl font-light leading-[1.2] md:text-4xl lg:text-5xl",
              isWarm ? "text-white" : "text-foreground"
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-5 text-base leading-relaxed",
              isWarm ? "text-white/60" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            {primaryButton.external ? (
              <a
                href={primaryButton.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-block border-b-2 pb-0.5 text-base font-medium transition-colors",
                  isWarm
                    ? "border-white text-white hover:border-white/50 hover:text-white/70"
                    : "border-[var(--brand-accent)] text-[var(--brand-accent)] hover:border-[var(--brand-accent-dark)] hover:text-[var(--brand-accent-dark)]"
                )}
              >
                {primaryButton.text}
              </a>
            ) : (
              <Link
                href={primaryButton.href}
                className={cn(
                  "inline-block border-b-2 pb-0.5 text-base font-medium transition-colors",
                  isWarm
                    ? "border-white text-white hover:border-white/50 hover:text-white/70"
                    : "border-[var(--brand-accent)] text-[var(--brand-accent)] hover:border-[var(--brand-accent-dark)] hover:text-[var(--brand-accent-dark)]"
                )}
              >
                {primaryButton.text}
              </Link>
            )}
            {secondaryButton && (
              <Link
                href={secondaryButton.href}
                className={cn(
                  "text-base transition-colors",
                  isWarm ? "text-white/50 hover:text-white/80" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {secondaryButton.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
