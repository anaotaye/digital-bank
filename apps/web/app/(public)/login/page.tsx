"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { LoginSchema, type LoginInput } from "@repo/shared/schemas/auth";

import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { getNextRoute } from "@/lib/routing";

import { AuthShell } from "@/components/auth/auth-shell";
import { ErrorBanner } from "@/components/auth/error-banner";
import { FieldWrap } from "@/components/auth/field-wrap";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: standardSchemaResolver(LoginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginInput) => {
    setApiError(null);
    setIsBusy(true);
    try {
      const customer = await login(values.email, values.password);
      // login() has set the customer in context. Bounce through `/`, which
      // resolves the right destination via getNextRoute — one source of truth.
      // Leave isBusy true — the redirect unmounts us; spinner spins through it.
      router.replace(getNextRoute(customer));
    } catch (err) {
      setIsBusy(false);
      setApiError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <AuthShell>
      <div>
        <h1
          className="font-serif text-[30px] leading-tight font-normal tracking-tight text-ink-950"
          style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
        >
          Welcome <em className="text-primary italic">back</em>
        </h1>
        <p className="mt-2 font-sans text-sm leading-snug text-ink-500">
          Sign in to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <ErrorBanner message={apiError} />

        <FieldWrap label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            autoFocus
            disabled={isSubmitting}
          />
        </FieldWrap>

        <FieldWrap label="Password" error={errors.password?.message}>
          <PasswordInput
            {...register("password")}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </FieldWrap>

        <SubmitButton
          type="submit"
          size="lg"
          className="mt-3 w-full"
          loading={isBusy}
        >
          {isBusy ? "Signing in…" : "Sign in"}
        </SubmitButton>
      </form>

      <div className="mt-auto text-center font-sans text-sm text-ink-500">
        New to Ann&apos;s?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}
