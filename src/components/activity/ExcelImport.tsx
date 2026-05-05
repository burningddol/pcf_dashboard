"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseExcel } from "@/lib/domain/excel";
import type { CreateActivityBody } from "@/types";

interface ImportStatus {
  success: number;
  failed: CreateActivityBody[];
}

async function postActivity(body: CreateActivityBody): Promise<void> {
  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("failed");
}

async function importBodies(bodies: CreateActivityBody[]): Promise<ImportStatus> {
  const results = await Promise.allSettled(bodies.map(postActivity));
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
  const [parseError, setParseError] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    setStatus(null);
    setParseError(false);

    try {
      const bodies = await parseExcel(file);
      const result = await importBodies(bodies);
      setStatus(result);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch {
      setParseError(true);
    } finally {
      setIsPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRetry(): Promise<void> {
    if (!status?.failed.length) return;
    setIsPending(true);

    const result = await importBodies(status.failed);
    setStatus((prev) => ({
      success: (prev?.success ?? 0) + result.success,
      failed: result.failed,
    }));
    queryClient.invalidateQueries({ queryKey: ["activities"] });
    setIsPending(false);
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
        className="px-3 py-1.5 rounded-[var(--r-2)] text-[12px] font-medium border border-[color:var(--line)] text-[color:var(--fg-2)] cursor-pointer hover:bg-[color:var(--bg-2)]"
        style={{ pointerEvents: isPending ? "none" : "auto", opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "가져오는 중…" : "Excel 가져오기"}
      </label>

      {parseError && (
        <span className="text-[11px] font-medium text-[color:var(--neg)]">파일 파싱 실패</span>
      )}

      {status && !parseError && (
        <span className="text-[11px] font-medium text-[color:var(--fg-3)]">
          ✓ {status.success}건 완료
          {status.failed.length > 0 && ` · ${status.failed.length}건 실패`}
        </span>
      )}

      {status && status.failed.length > 0 && !isPending && (
        <button
          onClick={handleRetry}
          className="px-2.5 py-1 rounded-[var(--r-2)] text-[11px] font-medium border border-[color:var(--neg)] text-[color:var(--neg)] cursor-pointer hover:bg-[color:var(--neg-soft)]"
        >
          실패 {status.failed.length}건 재시도
        </button>
      )}
    </div>
  );
}
