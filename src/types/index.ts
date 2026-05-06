export type ActivityType = "전기" | "원소재" | "운송";
export type Scope = "scope1" | "scope2" | "scope3";

export interface Company {
  id: string;
  name: string;
  country: string;
}

export interface EmissionFactor {
  id: string;
  activityType: string;
  value: number;
  unit: string;
  version: number;
  validFrom: string;
  source: string;
}

export interface Activity {
  id: string;
  companyId: string;
  activityType: ActivityType;
  description: string;
  yearMonth: string;
  amount: number;
  unit: string;
  factorId: string;
  factorValue: number;
  tCO2e: number;
  scope: Scope;
  createdAt: string;
}

export interface FilterState {
  from: string;
  to: string;
}

export interface CreateActivityBody {
  companyId: string;
  activityType: ActivityType;
  description: string;
  yearMonth: string;
  amount: number;
  unit: string;
  factorId: string;
  scope: Scope;
}
