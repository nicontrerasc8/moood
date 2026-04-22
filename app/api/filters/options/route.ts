import { getCurrentUser } from "@/lib/auth/session";
import { getFilterOptions } from "@/lib/queries/moood";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await getFilterOptions(user);

  return NextResponse.json(data);
}
