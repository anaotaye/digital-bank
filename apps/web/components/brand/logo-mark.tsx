import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /**
   * Drop the atmospheric radial glows. Below ~32px they turn to noise.
   */
  simple?: boolean;
  /**
   * Inverse variant — cream mark on transparent background.
   * Use on terracotta or ink backgrounds.
   */
  inverse?: boolean;
  ariaLabel?: string;
};

export function LogoMark({
  className,
  simple = false,
  inverse = false,
  ariaLabel = "Ann's Bank",
}: Props) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={cn("shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="ann-mark-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          {inverse ? (
            <>
              <stop offset="0%" stopColor="#FDF8F3" />
              <stop offset="100%" stopColor="#F5EFE8" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#D9603C" />
              <stop offset="100%" stopColor="#B04424" />
            </>
          )}
        </linearGradient>
        {!simple && (
          <>
            <radialGradient id="ann-mark-glow-1" cx="80%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#FFC896" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFC896" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ann-mark-glow-2" cx="15%" cy="90%" r="55%">
              <stop offset="0%" stopColor="#B7863C" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B7863C" stopOpacity="0" />
            </radialGradient>
          </>
        )}
        <clipPath id="ann-mark-clip">
          <rect width="128" height="128" rx="28" ry="28" />
        </clipPath>
      </defs>

      <g clipPath="url(#ann-mark-clip)">
        <rect width="128" height="128" fill="url(#ann-mark-bg)" />
        {!simple && (
          <>
            <rect width="128" height="128" fill="url(#ann-mark-glow-1)" />
            <rect width="128" height="128" fill="url(#ann-mark-glow-2)" />
          </>
        )}
        <text
          x="64"
          y="92"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), Fraunces, ui-serif, Georgia, serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="90"
          fill={inverse ? "#C9522F" : "#FDF8F3"}
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          A
        </text>
      </g>
    </svg>
  );
}
