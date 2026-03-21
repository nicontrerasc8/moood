import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function getServerSupabase() {
  return createServerClient();
}

export function getBrowserSupabase() {
  return createBrowserClient();
}

export async function fetchMoodView() {
  const supabase = await getServerSupabase();
  const viewName: keyof Database["public"]["Views"] = "vw_mood_checkins_enriched";

  return supabase.from(viewName).select("*");
}

export async function fetchOrgPyramidView() {
  const supabase = await getServerSupabase();
  const viewName: keyof Database["public"]["Views"] = "vw_org_pyramid";

  return supabase.from(viewName).select("*");
}
