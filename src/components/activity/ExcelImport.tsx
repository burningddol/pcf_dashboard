"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { parseExcel } from "@/lib/domain/excel";
import { postJson } from "@/lib/fetcher";
import type { Activity, CreateActivityBody } from "@/types";

interface ImportStatus {
  success: number;
  failed: CreateActivityBody[];
  error?: string;
}

async function importBodies(bodies: CreateActivityBody[]): Promise<ImportStatus> {
  const results = await Promise.allSettled(
    bodies.map((body) => postJson<Activity>("/api/activities", body))
  );
  return {
    success: results.filter((r) => r.status === "fulfilled").length,
    failed: bodies.filter((_, i) => results[i].status === "rejected"),
  };
}

export default function ExcelImport() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<ImportStatus | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    setStatus(null);

    try {
      const bodies = await parseExcel(file);
      const result = await importBodies(bodies);
      setStatus(result);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch {
      setStatus({ success: 0, failed: [], error: "파일 파싱 실패" });
    } finally {
      setIsPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRetry(): Promise<void> {
    if (!status?.failed.length) return;
    setIsPending(true);
    try {
      const result = await importBodies(status.failed);
      setStatus((prev) => ({
        success: (prev?.success ?? 0) + result.success,
        failed: result.failed,
      }));
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFile}
        disabled={isPending}
        className="hidden"
        id="excel-import"
      />
      <label
        htmlFor="excel-import"
        className={cn(
          "px-3 py-1.5 rounded-[var(--r-2)] text-[12px] font-medium border border-[color:var(--line)] text-[color:var(--fg-2)] cursor-pointer hover:bg-[color:var(--bg-2)]",
          isPending && "pointer-events-none opacity-60"
        )}
      >
        {isPending ? "가져오는 중…" : "Excel 가져오기"}
      </label>

      {status?.error && (
        <span className="text-[11px] font-medium text-[color:var(--neg)]">{status.error}</span>
      )}

      {status && !status.error && (
        <>
          <span className="text-[11px] font-medium text-[color:var(--fg-3)]">
            ✓ {status.success}건 완료
            {status.failed.length > 0 && ` · ${status.failed.length}건 실패`}
          </span>
          {status.failed.length > 0 && !isPending && (
            <button
              onClick={handleRetry}
              className="px-2.5 py-1 rounded-[var(--r-2)] text-[11px] font-medium border border-[color:var(--neg)] text-[color:var(--neg)] cursor-pointer hover:bg-[color:var(--neg-soft)]"
            >
              실패 {status.failed.length}건 재시도
            </button>
          )}
        </>
      )}
    </div>
  );
}
