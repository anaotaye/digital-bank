"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Wand2 } from "lucide-react";
import { SeedBvnSchema, type SeedBvnInput } from "@repo/shared/schemas/kyc";

import { api, ApiError } from "@/lib/api";
import type { Customer } from "@/lib/auth";
import {
  generateBvnOrNin,
  generateDob,
  generateNigerianPhone,
} from "@/lib/test-data";
import { ErrorBanner } from "@/components/auth/error-banner";
import { FieldWrap } from "@/components/auth/field-wrap";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";

type Props = {
  customer: Customer;
  onSuccess: () => void;
};

export function BvnForm({ customer, onSuccess }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SeedBvnInput>({
    resolver: standardSchemaResolver(SeedBvnSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
  });

  const fillTestData = () => {
    setValue("bvn", generateBvnOrNin(), { shouldValidate: true });
    setValue("dob", generateDob(), { shouldValidate: true });
    setValue("phone", generateNigerianPhone(), { shouldValidate: true });
  };

  const onSubmit = async (values: SeedBvnInput) => {
    setApiError(null);
    setIsBusy(true);
    try {
      await api("/api/kyc/bvn", { method: "POST", body: values });
      // Leave isBusy true — onSuccess navigates away; spinner spins through it.
      onSuccess();
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={fillTestData}
          disabled={isBusy || isSubmitting}
          className="inline-flex items-center gap-1.5 font-sans text-xs text-ink-500 transition-colors hover:text-primary disabled:opacity-50"
        >
          <Wand2 className="h-3 w-3" strokeWidth={2} />
          Fill with test data
        </button>
      </div>

      <ErrorBanner message={apiError} />

      <FieldWrap label="BVN" error={errors.bvn?.message}>
        <Input
          {...register("bvn")}
          inputMode="numeric"
          maxLength={11}
          placeholder="11-digit BVN"
          disabled={isSubmitting}
        />
      </FieldWrap>

      <div className="grid grid-cols-2 gap-2.5">
        <FieldWrap label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} disabled={isSubmitting} />
        </FieldWrap>
        <FieldWrap label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} disabled={isSubmitting} />
        </FieldWrap>
      </div>

      <FieldWrap label="Date of birth" error={errors.dob?.message}>
        <Input {...register("dob")} type="date" disabled={isSubmitting} />
      </FieldWrap>

      <FieldWrap label="Phone" error={errors.phone?.message}>
        <Input
          {...register("phone")}
          inputMode="numeric"
          maxLength={11}
          placeholder="08012345678"
          disabled={isSubmitting}
        />
      </FieldWrap>

      <SubmitButton
        type="submit"
        size="lg"
        className="mt-3 w-full"
        loading={isBusy}
      >
        {isBusy ? "Verifying…" : "Verify identity"}
      </SubmitButton>
    </form>
  );
}
