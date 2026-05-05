import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Scope } from "../src/types";

config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KG_TO_TONNE = 1000;

const company = { id: "ct-045", name: "CT-045 제조사", country: "KR" };

const factors = [
  {
    id: "ef-electricity-v1",
    activityType: "전기",
    value: 0.456,
    unit: "kgCO₂e/kWh",
    version: 1,
    validFrom: "2024-01",
    source: "KEPCO",
  },
  {
    id: "ef-plastic1-v1",
    activityType: "원소재",
    value: 2.3,
    unit: "kgCO₂e/kg",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
  {
    id: "ef-plastic1-v0",
    activityType: "원소재",
    value: 2.1,
    unit: "kgCO₂e/kg",
    version: 0,
    validFrom: "2023-01",
    source: "KEITI",
  },
  {
    id: "ef-plastic2-v1",
    activityType: "원소재",
    value: 3.2,
    unit: "kgCO₂e/kg",
    version: 1,
    validFrom: "2024-01",
    source: "KEITI",
  },
  {
    id: "ef-transport-v1",
    activityType: "운송",
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
  if (!factor) throw new Error(`Unknown factorId: ${factorId}`);
  return Math.round(((amount * factor.value) / KG_TO_TONNE) * 100) / 100;
}

type RawEntry = {
  yearMonth: string;
  activityType: string;
  description: string;
  amount: number;
  unit: string;
  factorId: string;
  scope: Scope;
};

const activities: RawEntry[] = [
  // 전기 (Scope 2)
  { yearMonth: "2025-01", activityType: "전기", description: "한국전력", amount: 110, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-02", activityType: "전기", description: "한국전력", amount: 112, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-03", activityType: "전기", description: "한국전력", amount: 115, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-04", activityType: "전기", description: "한국전력", amount: 130, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-05", activityType: "전기", description: "한국전력", amount: 120, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-05", activityType: "전기", description: "한국전력", amount: 101, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-06", activityType: "전기", description: "한국전력", amount: 110, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-07", activityType: "전기", description: "한국전력", amount: 120, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  { yearMonth: "2025-08", activityType: "전기", description: "한국전력", amount: 111, unit: "kWh", factorId: "ef-electricity-v1", scope: "scope2" },
  // 원소재 — 플라스틱 1 (Scope 3)
  { yearMonth: "2025-01", activityType: "원소재", description: "플라스틱 1", amount: 230, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-02", activityType: "원소재", description: "플라스틱 1", amount: 340, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-03", activityType: "원소재", description: "플라스틱 1", amount: 430, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-04", activityType: "원소재", description: "플라스틱 1", amount: 510, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "원소재", description: "플라스틱 1", amount: 424, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "원소재", description: "플라스틱 1", amount: 232, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-06", activityType: "원소재", description: "플라스틱 1", amount: 450, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-07", activityType: "원소재", description: "플라스틱 1", amount: 340, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  { yearMonth: "2025-08", activityType: "원소재", description: "플라스틱 1", amount: 230, unit: "kg", factorId: "ef-plastic1-v1", scope: "scope3" },
  // 원소재 — 플라스틱 2 (Scope 3)
  { yearMonth: "2025-03", activityType: "원소재", description: "플라스틱 2", amount: 23, unit: "kg", factorId: "ef-plastic2-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "원소재", description: "플라스틱 2", amount: 40, unit: "kg", factorId: "ef-plastic2-v1", scope: "scope3" },
  { yearMonth: "2025-07", activityType: "원소재", description: "플라스틱 2", amount: 43, unit: "kg", factorId: "ef-plastic2-v1", scope: "scope3" },
  // 운송 — 트럭 (Scope 3)
  { yearMonth: "2025-01", activityType: "운송", description: "트럭", amount: 41, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-02", activityType: "운송", description: "트럭", amount: 211, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-03", activityType: "운송", description: "트럭", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-04", activityType: "운송", description: "트럭", amount: 42, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "운송", description: "트럭", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-05", activityType: "운송", description: "트럭", amount: 12, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-06", activityType: "운송", description: "트럭", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-07", activityType: "운송", description: "트럭", amount: 41, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
  { yearMonth: "2025-08", activityType: "운송", description: "트럭", amount: 123, unit: "ton-km", factorId: "ef-transport-v1", scope: "scope3" },
];

async function main(): Promise<void> {
  await prisma.company.upsert({
    where: { id: company.id },
    update: {},
    create: company,
  });

  await Promise.all(
    factors.map((f) => prisma.emissionFactor.upsert({ where: { id: f.id }, update: f, create: f }))
  );

  await prisma.activity.deleteMany({ where: { companyId: company.id } });

  await prisma.activity.createMany({
    data: activities.map((a) => ({
      companyId: company.id,
      factorId: a.factorId,
      activityType: a.activityType,
      description: a.description,
      yearMonth: a.yearMonth,
      amount: a.amount,
      unit: a.unit,
      tCO2e: toTCO2e(a.amount, a.factorId),
      scope: a.scope,
      createdAt: new Date(`${a.yearMonth}-01T00:00:00.000Z`),
    })),
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
