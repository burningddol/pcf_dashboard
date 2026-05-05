"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseExcel } from "@/lib/domain/excel";
import type { CreateActivityBody } from "@/types";

type ImportStatus = { success: number; fail: number } | null;

export default function ExcelImport() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<ImportStatus>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    setStatus(null);

    try {
      const bodies = await parseExcel(file);
      const results = await Promise.allSettled(
        bodies.map((body: CreateActivityBody) =>
          fetch("/api/activities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).then((res) => {
            if (!res.ok) throw new Error("failed");
          })
        )
      );

      const success = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - success;
      setStatus({ success, fail });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch {
      setStatus({ success: 0, fail: -1 });
    } finally {
      setIsPending(false);
      if (inputRef.current) inputRef.current.value = "";
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
        className="px-3 py-1.5 rounded-[var(--r-2)] text-[12px] font-medium border border-[color:var(--line)] text-[color:var(--fg-2)] cursor-pointer hover:bg-[color:var(--bg-2)] disabled:opacity-60"
        style={{ pointerEvents: isPending ? "none" : "auto", opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "가져오는 중…" : "Excel 가져오기"}
      </label>
      {status && (
        <span
          className="text-[11px] font-medium"
          style={{ color: status.fail === -1 ? "var(--neg)" : "var(--fg-3)" }}
        >
          {status.fail === -1
            ? "파일 파싱 실패"
            : `✓ ${status.success}건 완료${status.fail > 0 ? ` · ${status.fail}건 실패` : ""}`}
        </span>
      )}
    </div>
  );
}
