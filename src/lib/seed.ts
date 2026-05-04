import type { Activity, ActivityType, Company, EmissionFactor, Scope } from "@/types";

export const companies: Company[] = [
  { id: "ct-045", name: "CT-045 제조사", country: "KR" },
];

export const factors: EmissionFactor[] = [
  {
    id: "ef-electricity-v1",
    activityType: "electricity",
    value: 0.456,
    unit: "kgCO₂e/kWh",
    version: 1,
    validFrom: "2024-01",
    source: "KEPCO",
  },
  {
    id: "ef-plastic1-v1",
    activityType: "plastic1",
    value: 2.3,
    unit: "kgCO₂e/kg",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
  {
    id: "ef-plastic1-v0",
    activityType: "plastic1",
    value: 2.1,
    unit: "kgCO₂e/kg",
    version: 0,
    validFrom: "2023-01",
    source: "KEITI",
  },
  {
    id: "ef-plastic2-v1",
    activityType: "plastic2",
    value: 3.2,
    unit: "kgCO₂e/kg",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
  {
    id: "ef-transport-v1",
    activityType: "transport",
    value: 3.5,
    unit: "kgCO₂e/ton-km",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
];

const factorMap = new Map(factors.map((f) => [f.id, f]));

function toTCO2e(amount: number, factorId: string): number {
  const factor = factorMap.get(factorId);
  if (!factor) return 0;
  return Math.round((amount * factor.value) / 10) / 100;
}

type RawEntry = {
  yearMonth: string;
  activityType: ActivityType;
  amount: number;
  unit: string;
  factorId: string;
  scope: Scope;
};

// 과제 Excel — 원본 활동 데이터 (CT-045 컴퓨터 화면)
const CT045: RawEntry[] = [
  // 전기 (Scope 2)
  { yearMonth: "2025-01", activityType: "electricity", amount: 110, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-02", activityType: "electricity", amount: 112, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-03", activityType: "electricity", amount: 115, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-04", activityType: "electricity", amount: 130, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-05", activityType: "electricity", amount: 120, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-05", activityType: "electricity", amount: 101, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-06", activityType: "electricity", amount: 110, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-07", activityType: "electricity", amount: 120, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-08", activityType: "electricity", amount: 111, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  // 원소재 — 플라스틱 1 (Scope 3)
  { yearMonth: "2025-01", activityType: "plastic1", amount: 230, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-02", activityType: "plastic1", amount: 340, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-03", activityType: "plastic1", amount: 430, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-04", activityType: "plastic1", amount: 510, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "plastic1", amount: 424, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "plastic1", amount: 232, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-06", activityType: "plastic1", amount: 450, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-07", activityType: "plastic1", amount: 340, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-08", activityType: "plastic1", amount: 230, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  // 원소재 — 플라스틱 2 (Scope 3)
  { yearMonth: "2025-03", activityType: "plastic2", amount: 23, unit: "kg", factorId: "ef-plastic2-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "plastic2", amount: 40, unit: "kg", factorId: "ef-plastic2-v1", scope: "scope3" },
  { yearMonth: "2025-07", activityType: "plastic2", amount: 43, unit: "kg", factorId: "ef-plastic2-v1", scope: "scope3" },
  // 운송 — 트럭 (Scope 3)
  { yearMonth: "2025-01", activityType: "transport", amount: 41, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-02", activityType: "transport", amount: 211, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-03", activityType: "transport", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-04", activityType: "transport", amount: 42, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "transport", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "transport", amount: 12, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-06", activityType: "transport", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-07", activityType: "transport", amount: 41, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-08", activityType: "transport", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
];

function buildActivities(): Activity[] {
  return CT045.map((entry, i) => ({
    id: `act-${i + 1}`,
    companyId: "ct-045",
    activityType: entry.activityType,
    yearMonth: entry.yearMonth,
    amount: entry.amount,
    unit: entry.unit,
    factorId: entry.factorId,
    tCO2e: toTCO2e(entry.amount, entry.factorId),
    scope: entry.scope,
    createdAt: `${entry.yearMonth}-01T00:00:00.000Z`,
  }));
}

export const activities: Activity[] = buildActivities();
