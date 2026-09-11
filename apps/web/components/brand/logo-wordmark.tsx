import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /**
   * Font sizing pair, [fraunces italic ann's size, sans bank size].
   * Given as Tailwind classes so consumers can adjust responsively.
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Inverse for dark backgrounds.
   */
  inverse?: boolean;
};

const sizeClasses: Record<
  NonNullable<Props["size"]>,
  { anns: string; bank: string; gap: string }
> = {
  sm: { anns: "text-lg", bank: "text-sm", gap: "gap-1" },
  md: { anns: "text-2xl", bank: "text-base", gap: "gap-1" },
  lg: { anns: "text-[34px]", bank: "text-[22px]", gap: "gap-1" },
  xl: { anns: "text-5xl", bank: "text-3xl", gap: "gap-1.5" },
};

export function LogoWordmark({
  className,
  size = "md",
  inverse = false,
}: Props) {
  const classes = sizeClasses[size];

  return (
    <div
      className={cn("flex items-baseline", classes.gap, className)}
      role="img"
      aria-label="Ann's Bank"
    >
      <span
        className={cn(
          "font-serif font-medium tracking-tight italic leading-none",
          classes.anns,
          inverse ? "text-cream" : "text-ink-950",
        )}
        style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
      >
        Ann&apos;s
      </span>
      <span
        className={cn(
          "font-sans font-medium tracking-tight leading-none",
          classes.bank,
          inverse ? "text-cream/70" : "text-ink-500",
        )}
      >
        bank
      </span>
    </div>
  );
}
