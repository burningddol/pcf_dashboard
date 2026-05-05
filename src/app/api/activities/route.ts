import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTCO2e } from "@/lib/domain/pcf";
import type { ActivityType, Scope } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const activities = await prisma.activity.findMany({
    where: {
      yearMonth: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    },
    orderBy: { yearMonth: "asc" },
  });

  return NextResponse.json(activities);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { companyId, activityType, yearMonth, amount, unit, factorId, scope } = body as {
    companyId: string;
    activityType: ActivityType;
    yearMonth: string;
    amount: number;
    unit: string;
    factorId: string;
    scope: Scope;
  };

  const factor = await prisma.emissionFactor.findUnique({
    where: { id: factorId },
    select: { value: true },
  });
  if (!factor) {
    return NextResponse.json({ error: "Invalid factorId" }, { status: 400 });
  }

  const tCO2e = computeTCO2e(amount, factor.value);

  const activity = await prisma.activity.create({
    data: { companyId, activityType, yearMonth, amount, unit, factorId, tCO2e, scope },
  });

  return NextResponse.json(activity, { status: 201 });
}
