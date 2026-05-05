import { prisma } from "@/lib/prisma";
import { computeTCO2e } from "@/lib/domain/pcf";
import type { Activity, ActivityType, CreateActivityBody, EmissionFactor, Scope } from "@/types";

export class SimulatedWriteError extends Error {
  constructor() {
    super("Simulated write failure");
  }
}

export class InvalidFactorError extends Error {
  constructor() {
    super("Invalid factorId");
  }
}

export type { CreateActivityBody };

function toActivity(row: {
  id: string;
  companyId: string;
  activityType: string;
  description: string;
  yearMonth: string;
  amount: number;
  unit: string;
  factorId: string;
  tCO2e: number;
  scope: string;
  createdAt: Date;
}): Activity {
  return {
    ...row,
    activityType: row.activityType as ActivityType,
    scope: row.scope as Scope,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getFactors(): Promise<EmissionFactor[]> {
  return prisma.emissionFactor.findMany({
    orderBy: [{ activityType: "asc" }, { version: "desc" }],
  });
}

export async function getActivities(from?: string | null, to?: string | null): Promise<Activity[]> {
  const rows = await prisma.activity.findMany({
    where: {
      yearMonth: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    },
    orderBy: { yearMonth: "asc" },
  });
  return rows.map(toActivity);
}

export async function createActivity(body: CreateActivityBody): Promise<Activity> {
  const failureRate = parseFloat(process.env.NEXT_PUBLIC_SIMULATE_FAILURE_RATE ?? "0.15");
  if (Math.random() < failureRate) throw new SimulatedWriteError();

  const factor = await prisma.emissionFactor.findUnique({
    where: { id: body.factorId },
    select: { value: true },
  });
  if (!factor) throw new InvalidFactorError();

  const row = await prisma.activity.create({
    data: {
      companyId: body.companyId,
      activityType: body.activityType,
      description: body.description,
      yearMonth: body.yearMonth,
      amount: body.amount,
      unit: body.unit,
      factorId: body.factorId,
      scope: body.scope,
      tCO2e: computeTCO2e(body.amount, factor.value),
    },
  });
  return toActivity(row);
}
