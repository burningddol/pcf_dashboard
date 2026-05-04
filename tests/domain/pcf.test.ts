import { describe, it, expect } from "vitest";
import { computeTCO2e } from "@/lib/domain/pcf";

describe("computeTCO2e", () => {
  it("전기 사용량을 tCO2e로 변환한다", () => {
    expect(computeTCO2e(1000, 0.456)).toBe(0.46);
  });

  it("소수점 둘째 자리에서 반올림한다", () => {
    expect(computeTCO2e(500, 2.3)).toBe(1.15);
  });

  it("amount가 0이면 0을 반환한다", () => {
    expect(computeTCO2e(0, 0.456)).toBe(0);
  });

  it("factorValue가 0이면 0을 반환한다", () => {
    expect(computeTCO2e(1000, 0)).toBe(0);
  });
});
