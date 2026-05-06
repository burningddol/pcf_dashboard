import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActivities, createActivity, SimulatedWriteError, InvalidFactorError } from "@/lib/api";
import { CreateActivityBodySchema } from "@/lib/domain/schemas";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const activities = await getActivities(from, to);
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const parsed = CreateActivityBodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const activity = await createActivity(parsed.data);
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
