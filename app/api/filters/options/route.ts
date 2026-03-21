import { getFilterOptions } from "@/lib/queries/moood";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getFilterOptions();

  return NextResponse.json(data);
}
