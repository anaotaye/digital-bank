"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { SignupSchema, type SignupInput } from "@repo/shared/schemas/auth";

import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

import { AuthShell } from "@/components/auth/auth-shell";
import { ErrorBanner } from "@/components/auth/error-banner";
import { FieldWrap } from "@/components/auth/field-wrap";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: standardSchemaResolver(SignupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupInput) => {
    setApiError(null);
    setIsBusy(true);
    try {
      await signup(values);
      // A fresh signup has no KYC yet — always lands in onboarding.
      // Don't reset isBusy: the redirect unmounts this component, and keeping
      // the spinner spinning through the transition avoids a flicker.
      router.replace("/onboarding/kyc");
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
          Open your <em className="text-primary italic">account</em>
        </h1>
        <p className="mt-2 font-sans text-sm leading-snug text-ink-500">
          Takes about a minute. We&apos;ll ask for your BVN or NIN in the next
          step.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <ErrorBanner message={apiError} />

        <div className="grid grid-cols-2 gap-2.5">
          <FieldWrap label="First name" error={errors.firstName?.message}>
            <Input
              {...register("firstName")}
              autoComplete="given-name"
              autoFocus
              disabled={isSubmitting}
            />
          </FieldWrap>
          <FieldWrap label="Last name" error={errors.lastName?.message}>
            <Input
              {...register("lastName")}
              autoComplete="family-name"
              disabled={isSubmitting}
            />
          </FieldWrap>
        </div>

        <FieldWrap label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            disabled={isSubmitting}
          />
        </FieldWrap>

        <FieldWrap label="Password" error={errors.password?.message}>
          <PasswordInput
            {...register("password")}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </FieldWrap>

        <SubmitButton
          type="submit"
          size="lg"
          className="mt-3 w-full"
          loading={isBusy}
        >
          {isBusy ? "Creating account…" : "Create account"}
        </SubmitButton>
      </form>

      <div className="mt-auto text-center font-sans text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
