import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  const factors = await prisma.emissionFactor.findMany({
    orderBy: [{ activityType: "asc" }, { version: "desc" }],
  });

  return NextResponse.json(factors);
}
