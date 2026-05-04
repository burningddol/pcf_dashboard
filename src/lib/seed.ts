import type { Activity, ActivityType, Company, EmissionFactor, Scope } from "@/types";

export const companies: Company[] = [
  { id: "acme-kr", name: "Acme Corp", country: "KR" },
  { id: "globex-de", name: "Globex", country: "DE" },
];

export const factors: EmissionFactor[] = [
  {
    id: "ef-electricity-v1",
    activityType: "electricity",
    value: 0.4781,
    unit: "kgCO₂e/kWh",
    version: 1,
    validFrom: "2024-01",
    source: "KEPCO",
  },
  {
    id: "ef-plastic1-v1",
    activityType: "plastic1",
    value: 1.9,
    unit: "kgCO₂e/kg",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
  {
    id: "ef-plastic1-v0",
    activityType: "plastic1",
    value: 1.85,
    unit: "kgCO₂e/kg",
    version: 0,
    validFrom: "2023-01",
    source: "KEITI",
  },
  {
    id: "ef-plastic2-v1",
    activityType: "plastic2",
    value: 2.15,
    unit: "kgCO₂e/kg",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
  {
    id: "ef-transport-v1",
    activityType: "transport",
    value: 0.098,
    unit: "kgCO₂e/ton-km",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
];

const MONTHS = [
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
];

type ActivityTemplate = {
  activityType: ActivityType;
  unit: string;
  factorId: string;
  scope: Scope;
  baseAmounts: [number, number]; // [acme, globex]
  monthlyDelta: number; // amount added per month index
};

const templates: ActivityTemplate[] = [
  {
    activityType: "electricity",
    unit: "kWh",
    factorId: "ef-electricity-v1",
    scope: "scope2",
    baseAmounts: [22000, 18000],
    monthlyDelta: 800,
  },
  {
    activityType: "plastic1",
    unit: "kg",
    factorId: "ef-plastic1-v1",
    scope: "scope3",
    baseAmounts: [900, 650],
    monthlyDelta: 50,
  },
  {
    activityType: "plastic2",
    unit: "kg",
    factorId: "ef-plastic2-v1",
    scope: "scope3",
    baseAmounts: [600, 420],
    monthlyDelta: 30,
  },
  {
    activityType: "transport",
    unit: "ton-km",
    factorId: "ef-transport-v1",
    scope: "scope3",
    baseAmounts: [3200, 2400],
    monthlyDelta: 120,
  },
];

const factorMap = new Map(factors.map((f) => [f.id, f]));

function computeTCO2e(amount: number, factorId: string): number {
  const factor = factorMap.get(factorId);
  if (!factor) return 0;
  return Math.round((amount * factor.value) / 10) / 100;
}

function buildActivities(): Activity[] {
  const activities: Activity[] = [];
  let seq = 1;

  for (const [companyIndex, company] of companies.entries()) {
    for (const [monthIndex, yearMonth] of MONTHS.entries()) {
      for (const tpl of templates) {
        const amount = tpl.baseAmounts[companyIndex] + monthIndex * tpl.monthlyDelta;
        activities.push({
          id: `act-${seq++}`,
          companyId: company.id,
          activityType: tpl.activityType,
          yearMonth,
          amount,
          unit: tpl.unit,
          factorId: tpl.factorId,
          tCO2e: computeTCO2e(amount, tpl.factorId),
          scope: tpl.scope,
          createdAt: `${yearMonth}-01T00:00:00.000Z`,
        });
      }
    }
  }

  return activities;
}

export const activities: Activity[] = buildActivities();
