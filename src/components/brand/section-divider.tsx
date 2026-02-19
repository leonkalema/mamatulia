import { cn } from "@/lib/utils";

type SectionDividerProps = {
  readonly variant?: "arc" | "subtle";
  readonly className?: string;
};

export function SectionDivider({ variant = "arc", className }: SectionDividerProps) {
  if (variant === "arc") {
    return (
      <div className={cn("relative h-16 overflow-hidden", className)}>
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 64C240 20 480 0 720 0C960 0 1200 20 1440 64V64H0V64Z"
            fill="currentColor"
            className="text-secondary"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="h-px w-16 bg-border" />
      <div className="mx-4 h-2 w-2 rotate-45 bg-primary/30" />
      <div className="h-px w-16 bg-border" />
    </div>
  );
}
