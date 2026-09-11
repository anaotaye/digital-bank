import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FieldWrap({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block font-sans text-xs font-medium text-ink-700">
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1 font-sans text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
