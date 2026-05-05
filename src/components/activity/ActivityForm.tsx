"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { postJson } from "@/lib/fetcher";
import { computeTCO2e } from "@/lib/domain/pcf";
import { mapToScope } from "@/lib/domain/scope";
import { COMPANY_ID, ACTIVITY_TYPES } from "@/lib/domain/constants";
import type { Activity, ActivityType, CreateActivityBody, EmissionFactor } from "@/types";

interface ActivityFormProps {
  factors: EmissionFactor[];
}

interface FormValues {
  activityType: ActivityType;
  factorId: string;
  description: string;
  yearMonth: string;
  amount: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-[11px] font-medium text-[color:var(--neg)]">{message}</span>;
}

export default function ActivityForm({ factors }: ActivityFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      activityType: "전기",
      factorId: "",
      description: "",
      yearMonth: "",
      amount: "",
    },
  });

  const { activityType, factorId, amount } = watch();

  const filteredFactors = useMemo(
    () => factors.filter((f) => f.activityType === activityType),
    [factors, activityType]
  );

  const selectedFactor = filteredFactors.find((f) => f.id === factorId);
  const amountUnit = selectedFactor?.unit.split("/")[1] ?? "";
  const preview =
    selectedFactor && amount ? computeTCO2e(parseFloat(amount), selectedFactor.value) : null;

  const mutation = useMutation({
    mutationFn: (body: CreateActivityBody) => postJson<Activity>("/api/activities", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      reset({ activityType, factorId: "", description: "", yearMonth: "", amount: "" });
    },
  });

  function onSubmit(values: FormValues): void {
    mutation.mutate({
      companyId: COMPANY_ID,
      activityType: values.activityType,
      description: values.description,
      yearMonth: values.yearMonth,
      amount: parseFloat(values.amount),
      unit: amountUnit,
      factorId: values.factorId,
      scope: mapToScope(values.activityType),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5">
      <div className="card-h mb-4">
        <p className="text-[12px] font-semibold text-[color:var(--fg)]">새 활동 추가</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="micro">활동 유형</span>
          <select
            {...register("activityType")}
            onChange={(e) => {
              setValue("activityType", e.target.value as ActivityType);
              setValue("factorId", "");
            }}
            className={inputClass}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="micro">배출계수</span>
          <select
            {...register("factorId", { required: "배출계수를 선택해주세요." })}
            className={cn(inputClass, errors.factorId && "border-[color:var(--neg)]")}
          >
            <option value="">선택</option>
            {filteredFactors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id} · {f.value} {f.unit}
              </option>
            ))}
          </select>
          <FieldError message={errors.factorId?.message} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="micro">설명</span>
          <input
            {...register("description", { required: "설명을 입력해주세요." })}
            type="text"
            placeholder="예: 플라스틱 1"
            className={cn(inputClass, errors.description && "border-[color:var(--neg)]")}
          />
          <FieldError message={errors.description?.message} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="micro">기간</span>
          <input
            {...register("yearMonth", {
              required: "기간을 입력해주세요.",
              pattern: { value: /^\d{4}-\d{2}$/, message: "YYYY-MM 형식으로 입력해주세요." },
            })}
            type="text"
            placeholder="YYYY-MM"
            className={cn(inputClass, errors.yearMonth && "border-[color:var(--neg)]")}
          />
          <FieldError message={errors.yearMonth?.message} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="micro">활동량{amountUnit && ` (${amountUnit})`}</span>
          <input
            {...register("amount", { required: "활동량을 입력해주세요.", min: 0 })}
            type="number"
            placeholder="0"
            step="any"
            className={cn(inputClass, errors.amount && "border-[color:var(--neg)]")}
          />
          <FieldError message={errors.amount?.message} />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="micro">tCO₂e 예상</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "num flex-1 px-2.5 py-1.5 rounded-[var(--r-2)] text-[12px] font-semibold bg-[color:var(--bg-2)]",
                preview != null ? "text-[color:var(--fg)]" : "text-[color:var(--fg-4)]"
              )}
            >
              {preview != null ? `${preview.toFixed(3)} t` : "—"}
            </span>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-1.5 rounded-[var(--r-2)] text-[12px] font-medium whitespace-nowrap bg-[color:var(--fg)] text-[color:var(--bg)] border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "저장 중…" : "추가"}
            </button>
          </div>
        </div>
      </div>

      {mutation.isError && (
        <p className="mt-3 text-[11px] font-medium text-[color:var(--neg)]">
          ✗ 저장에 실패했습니다. 다시 시도해주세요.
        </p>
      )}
    </form>
  );
}

const inputClass =
  "w-full px-2.5 py-1.5 border border-[color:var(--line)] rounded-[var(--r-2)] text-[12px] text-[color:var(--fg)] bg-[color:var(--bg)] box-border";
