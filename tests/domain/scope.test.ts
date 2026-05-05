import { describe, it, expect } from "vitest";
import { mapToScope } from "@/lib/domain/scope";

describe("mapToScope", () => {
  it("전기는 scope2를 반환한다", () => {
    expect(mapToScope("전기")).toBe("scope2");
  });

  it("원소재는 scope3를 반환한다", () => {
    expect(mapToScope("원소재")).toBe("scope3");
  });

  it("운송은 scope3를 반환한다", () => {
    expect(mapToScope("운송")).toBe("scope3");
  });
});
