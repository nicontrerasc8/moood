import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseUrl } from "@/lib/utils";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const moodPayloadSchema = z.object({
  mood: z.enum(["very_good", "good", "normal", "bad", "very_bad"]),
});

const moodMap = {
  very_good: { score: 5, label: "MUY BIEN" },
  good: { score: 4, label: "BIEN" },
  normal: { score: 3, label: "NORMAL" },
  bad: { score: 2, label: "MAL" },
  very_bad: { score: 1, label: "MUY MAL" },
} as const;

function getAdminSupabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user.company_id) {
    return NextResponse.json({ error: "company-scope-required" }, { status: 403 });
  }

  let payload: z.infer<typeof moodPayloadSchema>;
  try {
    payload = moodPayloadSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  try {
    const supabase = getAdminSupabase();
    const { score, label } = moodMap[payload.mood];

    const { data: profile, error: profileError } = await supabase
      .from("employee_profiles")
      .select("location_id,org_unit_id")
      .eq("employee_id", user.id)
      .maybeSingle<{ location_id: string | null; org_unit_id: string | null }>();

    if (profileError) {
      console.error("[api.mood.checkin] Failed to load employee profile", {
        employeeId: user.id,
        profileError,
      });
      return NextResponse.json({ error: "profile-load-failed" }, { status: 500 });
    }

    const insertPayload = {
      company_id: user.company_id,
      employee_id: user.id,
      org_unit_id: profile?.org_unit_id ?? user.org_unit_id ?? null,
      location_id: profile?.location_id ?? null,
      mood_score: score,
      mood_label: label,
      source: "manual_checkin",
      anonymity_mode: "identified",
      requested_followup: false,
    };

    const { data, error } = await supabase
      .from("mood_checkins")
      .insert(insertPayload)
      .select("id,checkin_at,mood_score,mood_label")
      .single();

    if (error) {
      console.error("[api.mood.checkin] Failed to insert mood checkin", {
        employeeId: user.id,
        insertPayload,
        error,
      });
      return NextResponse.json({ error: "insert-failed", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, checkin: data });
  } catch (error) {
    console.error("[api.mood.checkin] Unexpected failure", error);
    return NextResponse.json({ error: "unexpected-error" }, { status: 500 });
  }
}
