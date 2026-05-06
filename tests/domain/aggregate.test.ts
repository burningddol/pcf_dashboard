import { describe, it, expect } from "vitest";
import { aggregateByMonth, aggregateBySource, aggregateForSankey } from "@/lib/domain/aggregate";
import type { Activity } from "@/types";

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    companyId: "c1",
    activityType: "전기",
    description: "한국전력",
    yearMonth: "2025-01",
    amount: 1000,
    unit: "kWh",
    factorId: "f1",
    factorValue: 0.456,
    tCO2e: 0.46,
    scope: "scope2",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    companyId: "c1",
    activityType: "운송",
    description: "트럭",
    yearMonth: "2025-01",
    amount: 500,
    unit: "ton-km",
    factorId: "f2",
    factorValue: 3.5,
    tCO2e: 1.75,
    scope: "scope3",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    companyId: "c1",
    activityType: "전기",
    description: "한국전력",
    yearMonth: "2025-02",
    amount: 2000,
    unit: "kWh",
    factorId: "f1",
    factorValue: 0.456,
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
    expect(result[0].activityType).toBe("운송");
    expect(result[0].tCO2e).toBe(1.75);
    expect(result[1].activityType).toBe("전기");
    expect(result[1].tCO2e).toBeCloseTo(1.37);
  });

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(aggregateBySource([])).toEqual([]);
  });
});

describe("aggregateForSankey", () => {
  it("4단계 노드(설명→활동유형→Scope→total)를 생성한다", () => {
    const result = aggregateForSankey(ACTIVITIES);
    expect(result.nodes.find((n) => n.id === "한국전력")?.kind).toBe("activity");
    expect(result.nodes.find((n) => n.id === "전기")?.kind).toBe("category");
    expect(result.nodes.find((n) => n.id === "scope2")?.kind).toBe("scope");
    expect(result.nodes.find((n) => n.id === "total")?.kind).toBe("total");
  });

  it("total은 모든 활동의 tCO2e 합계다", () => {
    const result = aggregateForSankey(ACTIVITIES);
    expect(result.total).toBeCloseTo(0.46 + 1.75 + 0.91);
  });

  it("설명→활동유형→Scope→total 링크가 존재한다", () => {
    const result = aggregateForSankey(ACTIVITIES);
    expect(result.links.find((l) => l.source === "한국전력" && l.target === "전기")).toBeDefined();
    expect(result.links.find((l) => l.source === "전기" && l.target === "scope2")).toBeDefined();
    expect(
      result.links.find((l) => l.source === "scope2" && l.target === "total")?.value
    ).toBeCloseTo(0.46 + 0.91);
  });

  it("빈 배열이면 빈 노드/링크를 반환한다", () => {
    const result = aggregateForSankey([]);
    expect(result.nodes).toHaveLength(0);
    expect(result.links).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
