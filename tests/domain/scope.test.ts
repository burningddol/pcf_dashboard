import { describe, it, expect } from "vitest";
import { mapToScope } from "@/lib/domain/scope";

describe("mapToScope", () => {
  it("electricity는 scope2를 반환한다", () => {
    expect(mapToScope("electricity")).toBe("scope2");
  });

  it("plastic1은 scope3를 반환한다", () => {
    expect(mapToScope("plastic1")).toBe("scope3");
  });

  it("plastic2는 scope3를 반환한다", () => {
    expect(mapToScope("plastic2")).toBe("scope3");
  });

  it("transport는 scope3를 반환한다", () => {
    expect(mapToScope("transport")).toBe("scope3");
  });
});
