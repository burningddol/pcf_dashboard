import { describe, it, expect, vi } from "vitest";
import { utils, write } from "xlsx";
import { parseExcel } from "@/lib/domain/excel";

function createFile(rows: unknown[][], sheetName = "과제용 데이터"): File {
  const ws = utils.aoa_to_sheet([["h1"], ["h2"], ["h3"], ...rows]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, sheetName);
  const buf = write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new File([buf], "test.xlsx");
}

describe("parseExcel", () => {
  it("전기 행을 파싱한다", async () => {
    const file = createFile([["2025-01-01", "전기", "한국전력", 1000, "kWh"]]);
    const result = await parseExcel(file);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      activityType: "전기",
      yearMonth: "2025-01",
      amount: 1000,
      unit: "kWh",
      factorId: "ef-electricity-v1",
      scope: "scope2",
    });
  });

  it("운송 행을 파싱한다", async () => {
    const file = createFile([["2025-03-15", "운송", "육상운송", 500, "km"]]);
    const result = await parseExcel(file);
    expect(result[0]).toMatchObject({
      activityType: "운송",
      yearMonth: "2025-03",
      factorId: "ef-transport-v1",
      scope: "scope3",
    });
  });

  it("원소재 설명에 '1' 포함 시 ef-plastic1-v1을 사용한다", async () => {
    const file = createFile([["2025-02-01", "원소재", "플라스틱 1", 200, "kg"]]);
    const result = await parseExcel(file);
    expect(result[0].factorId).toBe("ef-plastic1-v1");
  });

  it("원소재 설명에 '2' 포함 시 ef-plastic2-v1을 사용한다", async () => {
    const file = createFile([["2025-02-01", "원소재", "플라스틱 2", 300, "kg"]]);
    const result = await parseExcel(file);
    expect(result[0].factorId).toBe("ef-plastic2-v1");
  });

  it("원소재 설명에 숫자 없으면 기본 ef-plastic1-v1을 사용한다", async () => {
    const file = createFile([["2025-02-01", "원소재", "플라스틱", 300, "kg"]]);
    const result = await parseExcel(file);
    expect(result[0].factorId).toBe("ef-plastic1-v1");
  });

  it("날짜가 없는 행을 건너뛴다", async () => {
    const file = createFile([
      [null, "전기", "설명", 100, "kWh"],
      ["2025-01-01", "전기", "설명", 200, "kWh"],
    ]);
    const result = await parseExcel(file);
    expect(result).toHaveLength(1);
  });

  it("유효하지 않은 활동 유형 행을 건너뛴다", async () => {
    const file = createFile([["2025-01-01", "모름", "설명", 100, "kWh"]]);
    const result = await parseExcel(file);
    expect(result).toHaveLength(0);
  });

  it("amount가 없는 행을 건너뛴다", async () => {
    const file = createFile([["2025-01-01", "전기", "설명", null, "kWh"]]);
    const result = await parseExcel(file);
    expect(result).toHaveLength(0);
  });

  it("여러 행을 함께 파싱한다", async () => {
    const file = createFile([
      ["2025-01-01", "전기", "한국전력", 1000, "kWh"],
      ["2025-02-01", "운송", "육상", 500, "km"],
      ["2025-03-01", "원소재", "플라스틱 1", 200, "kg"],
    ]);
    const result = await parseExcel(file);
    expect(result).toHaveLength(3);
  });

  it("'과제용 데이터' 시트가 없으면 reject한다", async () => {
    const file = createFile([["2025-01-01", "전기", "설명", 100, "kWh"]], "다른시트");
    await expect(parseExcel(file)).rejects.toThrow("'과제용 데이터' 시트를 찾을 수 없습니다.");
  });

  it("FileReader 오류 시 reject한다", async () => {
    const file = new File([], "empty.xlsx");
    vi.spyOn(FileReader.prototype, "readAsArrayBuffer").mockImplementationOnce(function (
      this: FileReader,
    ) {
      setTimeout(() => this.onerror?.(new ProgressEvent("error") as ProgressEvent<FileReader>), 0);
    });
    await expect(parseExcel(file)).rejects.toThrow("파일을 읽는 데 실패했습니다.");
  });
});
