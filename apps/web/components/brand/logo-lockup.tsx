import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";
import { LogoWordmark } from "./logo-wordmark";

type Props = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
  tagline?: string;
};

const config = {
  sm: {
    horizontal: { mark: "h-8 w-8", wordmark: "sm" as const, gap: "gap-2.5" },
    vertical: { mark: "h-12 w-12", wordmark: "md" as const, gap: "gap-3" },
  },
  md: {
    horizontal: { mark: "h-11 w-11", wordmark: "md" as const, gap: "gap-3" },
    vertical: { mark: "h-16 w-16", wordmark: "lg" as const, gap: "gap-4" },
  },
  lg: {
    horizontal: { mark: "h-14 w-14", wordmark: "lg" as const, gap: "gap-3.5" },
    vertical: { mark: "h-24 w-24", wordmark: "xl" as const, gap: "gap-5" },
  },
};

export function LogoLockup({
  className,
  orientation = "horizontal",
  size = "md",
  inverse = false,
  tagline,
}: Props) {
  const c = config[size][orientation];

  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "items-center" : "flex-col items-start",
        c.gap,
        className,
      )}
    >
      <LogoMark className={c.mark} inverse={inverse} simple={size === "sm"} />
      <div
        className={
          orientation === "vertical" ? "flex flex-col items-start" : ""
        }
      >
        <LogoWordmark size={c.wordmark} inverse={inverse} />
        {tagline && (
          <div
            className={cn(
              "mt-1 font-sans text-xs tracking-wide",
              inverse ? "text-cream/60" : "text-ink-500",
            )}
          >
            {tagline}
          </div>
        )}
      </div>
    </div>
  );
}
