import { redirect } from "next/navigation";
import { getAuthUserRecord, hasActiveSession } from "@/lib/auth/queries";
import { hasRole } from "@/lib/permissions";
import { hasEnvVars } from "@/lib/utils";
import type { AppUser, Role } from "@/types/app";

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!hasEnvVars) {
    return null;
  }

  return getAuthUserRecord();
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    const sessionExists = await hasActiveSession();
    console.error("[auth.requireUser] Unable to resolve application user", {
      sessionExists,
    });
    redirect(sessionExists ? "/auth/login?error=missing-employee-link" : "/auth/login?error=session-required");
  }

  return user;
}

export async function requireRole(minimumRole: Role, redirectTo = "/mood?error=insufficient-role") {
  const user = await requireUser();

  if (!hasRole(user, minimumRole)) {
    redirect(redirectTo);
  }

  return user;
}
