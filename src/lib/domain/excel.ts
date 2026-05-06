import { read, utils } from "xlsx";
import { mapToScope } from "@/lib/domain/scope";
import { COMPANY_ID } from "@/lib/domain/constants";
import { CreateActivityBodySchema } from "@/lib/domain/schemas";
import type { ActivityType, CreateActivityBody } from "@/types";

const FACTOR_ID: Record<string, string> = {
  전기: "ef-electricity-v1",
  운송: "ef-transport-v1",
  "원소재-1": "ef-plastic1-v1",
  "원소재-2": "ef-plastic2-v1",
  원소재: "ef-plastic1-v1",
};

function inferFactorId(activityType: string, description: string): string {
  if (activityType === "원소재") {
    if (description.includes("2")) return FACTOR_ID["원소재-2"];
    if (description.includes("1")) return FACTOR_ID["원소재-1"];
  }
  return FACTOR_ID[activityType] ?? "";
}

export function parseExcel(file: File): Promise<CreateActivityBody[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = read(e.target?.result, { type: "array" });
        const ws = wb.Sheets["과제용 데이터"];
        if (!ws) throw new Error("'과제용 데이터' 시트를 찾을 수 없습니다.");

        const rows = utils.sheet_to_json<unknown[]>(ws, { header: 1 });

        const bodies: CreateActivityBody[] = [];
        for (const row of rows.slice(3)) {
          const [date, activityType, description, amount, unit] = row as [
            string,
            string,
            string,
            number,
            string,
          ];
          if (!date) continue;

          const candidate = {
            companyId: COMPANY_ID,
            activityType,
            description,
            yearMonth: String(date).slice(0, 7),
            amount: Number(amount),
            unit,
            factorId: inferFactorId(activityType, description),
            scope: mapToScope(activityType as ActivityType),
          };
          const parsed = CreateActivityBodySchema.safeParse(candidate);
          if (parsed.success) bodies.push(parsed.data);
        }

        resolve(bodies);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("파일을 읽는 데 실패했습니다."));
    reader.readAsArrayBuffer(file);
  });
}
