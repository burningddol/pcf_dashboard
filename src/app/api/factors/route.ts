import { NextResponse } from "next/server";
import { getFactors } from "@/lib/api";

export async function GET(): Promise<NextResponse> {
  const factors = await getFactors();
  return NextResponse.json(factors);
}
