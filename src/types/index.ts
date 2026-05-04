export type ActivityType =
  | "electricity"
  | "plastic1"
  | "plastic2"
  | "transport";
export type Scope = "scope2" | "scope3";

export interface Company {
  id: string;
  name: string;
  country: string;
}

export interface EmissionFactor {
  id: string;
  activityType: ActivityType;
  value: number; // kgCO₂e per unit
  unit: string;
  version: number;
  validFrom: string; // YYYY-MM
  source: string;
}

export interface Activity {
  id: string;
  companyId: string;
  activityType: ActivityType;
  yearMonth: string; // YYYY-MM
  amount: number;
  unit: string;
  factorId: string;
  tCO2e: number;
  scope: Scope;
  createdAt: string;
}

export interface FilterState {
  from: string; // YYYY-MM
  to: string; // YYYY-MM
}
