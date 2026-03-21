import { connection } from "next/server";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction } from "@/lib/auth/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await connection();
  const params = await searchParams;

  return (
    <AuthPanel
      eyebrow="Recuperación"
      title="Restablecer contraseña"
      description="Envía el correo de recuperación a Supabase con redirect seguro hacia la actualización de contraseña."
    >
      <AuthMessage error={params.error} success={params.success} />
      <form action={forgotPasswordAction} className="space-y-4">
        <Input placeholder="correo@empresa.com" type="email" name="email" required />
        <button className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          Enviar enlace
        </button>
      </form>
    </AuthPanel>
  );
}
