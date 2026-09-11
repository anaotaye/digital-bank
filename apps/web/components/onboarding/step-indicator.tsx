type Props = {
  current: 1 | 2;
};

export function StepIndicator({ current }: Props) {
  const steps = [
    { n: 1, label: "Identity" },
    { n: 2, label: "Account" },
  ] as const;

  return (
    <div
      className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-ink-500 uppercase"
      aria-label={`Step ${current} of 2`}
    >
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center gap-2">
          <span
            className={
              step.n === current
                ? "font-semibold text-primary"
                : step.n < current
                  ? "text-ink-700"
                  : "text-ink-400"
            }
          >
            0{step.n} · {step.label}
          </span>
          {i < steps.length - 1 && <span className="text-ink-300">·</span>}
        </div>
      ))}
    </div>
  );
}
