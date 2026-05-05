import { NextRequest, NextResponse } from "next/server";
import { getActivities, createActivity, SimulatedWriteError, InvalidFactorError } from "@/lib/api";
import type { CreateActivityBody } from "@/lib/api";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const activities = await getActivities(from, to);
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: CreateActivityBody = await req.json();

  try {
    const activity = await createActivity(body);
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    if (err instanceof SimulatedWriteError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof InvalidFactorError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
