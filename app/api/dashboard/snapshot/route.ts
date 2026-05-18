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
    fromDate: searchParams.get("fromDate") ?? "",
    toDate: searchParams.get("toDate") ?? "",
    dateRange: searchParams.get("dateRange") ?? "",
    companyId: user.company_id ?? "",
    locationId: searchParams.get("locationId") ?? "",
    orgUnitId: searchParams.get("orgUnitId") ?? "",
    gender: searchParams.get("gender") ?? "",
    ageRange: searchParams.get("ageRange") ?? "",
    jobTitle: searchParams.get("jobTitle") ?? "",
    education: searchParams.get("education") ?? "",
    workShift: searchParams.get("workShift") ?? "",
    occupationalGroup: searchParams.get("occupationalGroup") ?? "",
    tenureBand: searchParams.get("tenureBand") ?? "",
    shiftName: searchParams.get("shiftName") ?? "",
    costCenter: searchParams.get("costCenter") ?? "",
    teamName: searchParams.get("teamName") ?? "",
    projectName: searchParams.get("projectName") ?? "",
    isLeader: searchParams.get("isLeader") ?? "",
  });

  return NextResponse.json(data);
}
