import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/queries/moood";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const data = await getDashboardSnapshot(user, {
    dateRange: searchParams.get("dateRange") ?? "",
    companyId: searchParams.get("companyId") ?? "",
    locationId: searchParams.get("locationId") ?? "",
    orgUnitId: searchParams.get("orgUnitId") ?? "",
    gender: searchParams.get("gender") ?? "",
    ageRange: searchParams.get("ageRange") ?? "",
    jobTitle: searchParams.get("jobTitle") ?? "",
    education: searchParams.get("education") ?? "",
    workShift: searchParams.get("workShift") ?? "",
    occupationalGroup: searchParams.get("occupationalGroup") ?? "",
    companyType: searchParams.get("companyType") ?? "",
  });

  return NextResponse.json(data);
}
