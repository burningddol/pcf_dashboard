import { read, utils } from "xlsx";
import { mapToScope } from "@/lib/domain/scope";
import type { ActivityType, CreateActivityBody } from "@/types";

const COMPANY_ID = "ct-045";
const ACTIVITY_TYPES = new Set<string>(["전기", "원소재", "운송"]);

const FACTOR_MAP: Record<string, Record<string, string>> = {
  전기: { default: "ef-electricity-v1" },
  운송: { default: "ef-transport-v1" },
  원소재: { "1": "ef-plastic1-v1", "2": "ef-plastic2-v1", default: "ef-plastic1-v1" },
};

function inferFactorId(activityType: string, description: string): string {
  const factors = FACTOR_MAP[activityType];
  if (!factors) return "";
  if (activityType === "원소재") {
    if (description.includes("2")) return factors["2"];
    if (description.includes("1")) return factors["1"];
  }
  return factors.default;
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

          if (!date || !ACTIVITY_TYPES.has(activityType) || !amount) continue;

          const yearMonth = String(date).slice(0, 7);
          const factorId = inferFactorId(activityType, description);

          bodies.push({
            companyId: COMPANY_ID,
            activityType: activityType as ActivityType,
            description,
            yearMonth,
            amount: Number(amount),
            unit,
            factorId,
            scope: mapToScope(activityType as ActivityType),
          });
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
