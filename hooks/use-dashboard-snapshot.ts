"use client";

import useSWR from "swr";
import type { DashboardFilters, DashboardSnapshot } from "@/types/app";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

function buildSnapshotUrl(filters: DashboardFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/api/dashboard/snapshot?${query}` : "/api/dashboard/snapshot";
}

export function useDashboardSnapshot(initialData: DashboardSnapshot, filters: DashboardFilters) {
  return useSWR<DashboardSnapshot>(buildSnapshotUrl(filters), fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
  });
}
