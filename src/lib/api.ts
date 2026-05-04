import type { Activity, Company, EmissionFactor, FilterState } from "@/types";
import {
  activities as seedActivities,
  companies as seedCompanies,
  factors as seedFactors,
} from "./seed";

interface Store {
  companies: Company[];
  activities: Activity[];
  factors: EmissionFactor[];
}

const store: Store = {
  companies: [...seedCompanies],
  activities: [...seedActivities],
  factors: [...seedFactors],
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const jitter = () => Math.floor(200 + Math.random() * 600);
const shouldFail = () =>
  Math.random() < Number(process.env.NEXT_PUBLIC_SIMULATE_FAILURE_RATE ?? 0.15);

export async function getCompanies(): Promise<Company[]> {
  await delay(jitter());
  return [...store.companies];
}

export async function getActivities(filter?: Partial<FilterState>): Promise<Activity[]> {
  await delay(jitter());
  let result = [...store.activities];
  if (filter?.companyId) result = result.filter((a) => a.companyId === filter.companyId);
  if (filter?.from) result = result.filter((a) => a.yearMonth >= filter.from!);
  if (filter?.to) result = result.filter((a) => a.yearMonth <= filter.to!);
  return result;
}

export async function getFactors(): Promise<EmissionFactor[]> {
  await delay(jitter());
  const latestVersionByType = new Map<string, number>();

  for (const f of store.factors) {
    const current = latestVersionByType.get(f.activityType) ?? -1;
    if (f.version > current) latestVersionByType.set(f.activityType, f.version);
  }

  return store.factors.filter(
    (f) => f.version === latestVersionByType.get(f.activityType)
  );
}

export async function getAllFactors(): Promise<EmissionFactor[]> {
  await delay(jitter());
  return [...store.factors];
}

export async function createActivity(
  input: Omit<Activity, "id" | "createdAt">
): Promise<Activity> {
  await delay(jitter());
  if (shouldFail()) throw new Error("Save failed");

  const activity: Activity = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.activities = [...store.activities, activity];
  return activity;
}
