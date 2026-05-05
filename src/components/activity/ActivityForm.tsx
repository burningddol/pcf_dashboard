"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { computeTCO2e } from "@/lib/domain/pcf";
import { mapToScope } from "@/lib/domain/scope";
import type { Activity, ActivityType, CreateActivityBody, EmissionFactor } from "@/types";

const ACTIVITY_TYPES: ActivityType[] = ["전기", "원소재", "운송"];
const COMPANY_ID = "ct-045";

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
    defaultValues: { activityType: "전기", factorId: "", description: "", yearMonth: "", amount: "" },
  });

  const activityType = watch("activityType");
  const factorId = watch("factorId");
  const amount = watch("amount");

  const filteredFactors = useMemo(
    () => factors.filter((f) => f.activityType === activityType),
    [factors, activityType]
  );

  const selectedFactor = filteredFactors.find((f) => f.id === factorId);
  const amountUnit = selectedFactor?.unit.split("/")[1] ?? "";
  const preview =
    selectedFactor && amount ? computeTCO2e(parseFloat(amount), selectedFactor.value) : null;

  const mutation = useMutation({
    mutationFn: (body: CreateActivityBody) =>
      fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json() as Promise<Activity>;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      reset({ activityType, factorId: "", description: "", yearMonth: "", amount: "" });
    },
  });

  function onSubmit(values: FormValues): void {
    if (!selectedFactor) return;
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
    <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ padding: 20 }}>
      <div className="card-h" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--fg)" }}>새 활동 추가</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <label className="col" style={{ gap: 6 }}>
          <span className="micro">활동 유형</span>
          <select
            {...register("activityType")}
            onChange={(e) => {
              setValue("activityType", e.target.value as ActivityType);
              setValue("factorId", "");
            }}
            style={inputStyle}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="col" style={{ gap: 6 }}>
          <span className="micro">배출계수</span>
          <select
            {...register("factorId", { required: "배출계수를 선택해주세요." })}
            style={{
              ...inputStyle,
              ...(errors.factorId && { borderColor: "var(--neg)" }),
            }}
          >
            <option value="">선택</option>
            {filteredFactors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id} · {f.value} {f.unit}
              </option>
            ))}
          </select>
          {errors.factorId && (
            <span style={{ fontSize: "var(--t-xs)", color: "var(--neg)", fontWeight: 500 }}>
              {errors.factorId.message}
            </span>
          )}
        </label>

        <label className="col" style={{ gap: 6 }}>
          <span className="micro">설명</span>
          <input
            {...register("description", { required: true })}
            type="text"
            placeholder="예: 플라스틱 1"
            style={inputStyle}
          />
        </label>

        <label className="col" style={{ gap: 6 }}>
          <span className="micro">기간</span>
          <input
            {...register("yearMonth", { required: true, pattern: /^\d{4}-\d{2}$/ })}
            type="text"
            placeholder="YYYY-MM"
            style={inputStyle}
          />
        </label>

        <label className="col" style={{ gap: 6 }}>
          <span className="micro">활동량{amountUnit && ` (${amountUnit})`}</span>
          <input
            {...register("amount", { required: true, min: 0 })}
            type="number"
            placeholder="0"
            step="any"
            style={inputStyle}
          />
        </label>

        <div className="col" style={{ gap: 6 }}>
          <span className="micro">tCO₂e 예상</span>
          <div className="row" style={{ gap: 8 }}>
            <span
              className="num"
              style={{
                flex: 1,
                padding: "6px 10px",
                background: "var(--bg-2)",
                borderRadius: "var(--r-2)",
                fontSize: "var(--t-sm)",
                fontWeight: 600,
                color: preview != null ? "var(--fg)" : "var(--fg-4)",
              }}
            >
              {preview != null ? `${preview.toFixed(3)} t` : "—"}
            </span>
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                padding: "6px 16px",
                background: "var(--fg)",
                color: "var(--bg)",
                border: "none",
                borderRadius: "var(--r-2)",
                fontSize: "var(--t-sm)",
                fontWeight: 500,
                cursor: mutation.isPending ? "not-allowed" : "pointer",
                opacity: mutation.isPending ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {mutation.isPending ? "저장 중…" : "추가"}
            </button>
          </div>
        </div>
      </div>

      {mutation.isError && (
        <p style={{ marginTop: 12, fontSize: "var(--t-xs)", color: "var(--neg)", fontWeight: 500 }}>
          ✗ 저장에 실패했습니다. 다시 시도해주세요.
        </p>
      )}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-2)",
  fontSize: "var(--t-sm)",
  color: "var(--fg)",
  background: "var(--bg)",
  boxSizing: "border-box",
};
