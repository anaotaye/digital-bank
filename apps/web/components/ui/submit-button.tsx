"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button> & {
  loading?: boolean;
};

export function SubmitButton({
  loading,
  disabled,
  children,
  className,
  ...props
}: Props) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
