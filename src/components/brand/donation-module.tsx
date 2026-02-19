"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { EXTERNAL_LINKS } from "@/constants/links";

type DonationAmount = {
  readonly value: number;
  readonly label: string;
  readonly impact: string;
};

type DonationModuleProps = {
  readonly amounts?: readonly DonationAmount[];
  readonly defaultAmount?: number;
  readonly className?: string;
};

const DEFAULT_AMOUNTS: readonly DonationAmount[] = [
  { value: 25, label: "$25", impact: "1 week of formula" },
  { value: 50, label: "$50", impact: "1 preemie kit" },
  { value: 100, label: "$100", impact: "1 month of care" },
  { value: 250, label: "$250", impact: "Full family support" },
] as const;

export function DonationModule({
  amounts = DEFAULT_AMOUNTS,
  defaultAmount = 50,
  className,
}: DonationModuleProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
  const selectedImpact = amounts.find((a) => a.value === selectedAmount)?.impact || "";

  return (
    <div className={cn("rounded-2xl border bg-card p-6 shadow-[var(--shadow-md)] md:p-8", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-serif text-xl font-normal">Give a Preemie Kit</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Your gift provides essential supplies for premature babies and their mothers.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {amounts.map((amount) => (
          <button
            key={amount.value}
            type="button"
            onClick={() => setSelectedAmount(amount.value)}
            className={cn(
              "rounded-lg border-2 px-4 py-3 text-center transition-all duration-[var(--duration-fast)]",
              selectedAmount === amount.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="block text-lg font-semibold">{amount.label}</span>
            <span className="block text-xs text-muted-foreground">{amount.impact}</span>
          </button>
        ))}
      </div>
      {selectedImpact && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Your <span className="font-medium text-foreground">${selectedAmount}</span> provides{" "}
          <span className="font-medium text-primary">{selectedImpact}</span>
        </p>
      )}
      <Button asChild size="lg" className="mt-6 w-full rounded-full">
        <a
          href={`${EXTERNAL_LINKS.DONATE}?amount=${selectedAmount}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate ${selectedAmount}
        </a>
      </Button>
    </div>
  );
}
