"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.email(),
});

const updatePasswordSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function signInAction(formData: FormData) {
  if (!hasEnvVars) {
    console.error("[auth.signInAction] Missing Supabase environment variables");
    redirect("/auth/login?error=missing-env");
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    console.warn("[auth.signInAction] Invalid login payload", {
      email: formData.get("email"),
      issues: parsed.error.issues,
    });
    redirect("/auth/login?error=invalid-credentials");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("[auth.signInAction] Supabase signInWithPassword failed", {
      email: parsed.data.email,
      code: error.code,
      message: error.message,
      status: error.status,
    });
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!user) {
    console.error("[auth.signInAction] Sign-in succeeded without returning a user", {
      email: parsed.data.email,
    });
    redirect("/auth/login?error=session-required");
  }

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("app_role")
    .eq("auth_user_id", user.id)
    .single<{ app_role: "super_admin" | "hr_admin" | "leader" | "employee" }>();

  if (employeeError || !employee) {
    console.error("[auth.signInAction] Auth user is not linked to an employee", {
      auth_user_id: user.id,
      email: user.email,
      employeeError,
    });
    redirect("/auth/login?error=missing-employee-link");
  }

  redirect(employee.app_role === "employee" ? "/mood" : "/dashboard");
}

export async function forgotPasswordAction(formData: FormData) {
  if (!hasEnvVars) {
    redirect("/auth/forgot-password?error=missing-env");
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/auth/forgot-password?error=invalid-email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/confirm?next=/auth/update-password`,
  });

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/forgot-password?success=recovery-sent");
}

export async function updatePasswordAction(formData: FormData) {
  if (!hasEnvVars) {
    redirect("/auth/update-password?error=missing-env");
  }

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/auth/update-password?error=password-mismatch");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?success=password-updated");
}

export async function signOutAction() {
  if (!hasEnvVars) {
    redirect("/auth/login?success=signed-out");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login?success=signed-out");
}
