import { describe, it, expect } from "vitest";
import { aggregateByMonth, aggregateBySource } from "@/lib/domain/aggregate";
import type { Activity } from "@/types";

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    companyId: "c1",
    activityType: "electricity",
    yearMonth: "2025-01",
    amount: 1000,
    unit: "kWh",
    factorId: "f1",
    tCO2e: 0.46,
    scope: "scope2",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    companyId: "c1",
    activityType: "transport",
    yearMonth: "2025-01",
    amount: 500,
    unit: "km",
    factorId: "f2",
    tCO2e: 1.75,
    scope: "scope3",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    companyId: "c1",
    activityType: "electricity",
    yearMonth: "2025-02",
    amount: 2000,
    unit: "kWh",
    factorId: "f1",
    tCO2e: 0.91,
    scope: "scope2",
    createdAt: "2025-02-01T00:00:00.000Z",
  },
];

describe("aggregateByMonth", () => {
  it("월별로 tCO2e를 집계한다", () => {
    const result = aggregateByMonth(ACTIVITIES);
    expect(result).toHaveLength(2);
    expect(result[0].yearMonth).toBe("2025-01");
    expect(result[0].scope2).toBe(0.46);
    expect(result[0].scope3).toBe(1.75);
    expect(result[0].total).toBeCloseTo(2.21);
    expect(result[1].yearMonth).toBe("2025-02");
    expect(result[1].scope2).toBe(0.91);
  });

  it("yearMonth 오름차순으로 정렬한다", () => {
    const result = aggregateByMonth([...ACTIVITIES].reverse());
    expect(result[0].yearMonth).toBe("2025-01");
    expect(result[1].yearMonth).toBe("2025-02");
  });

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(aggregateByMonth([])).toEqual([]);
  });
});

describe("aggregateBySource", () => {
  it("활동 유형별 tCO2e 합계를 내림차순으로 반환한다", () => {
    const result = aggregateBySource(ACTIVITIES);
    expect(result[0].activityType).toBe("transport");
    expect(result[0].tCO2e).toBe(1.75);
    expect(result[1].activityType).toBe("electricity");
    expect(result[1].tCO2e).toBeCloseTo(1.37);
  });

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(aggregateBySource([])).toEqual([]);
  });
});
