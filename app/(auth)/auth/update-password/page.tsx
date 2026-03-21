import { connection } from "next/server";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "@/lib/auth/actions";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await connection();
  const params = await searchParams;

  return (
    <AuthPanel
      eyebrow="Nuevo acceso"
      title="Actualizar contraseña"
      description="Disponible después del recovery link o una sesión con token válido."
    >
      <AuthMessage error={params.error} success={params.success} />
      <form action={updatePasswordAction} className="space-y-4">
        <Input placeholder="Nueva contraseña" type="password" name="password" required />
        <Input placeholder="Confirmar contraseña" type="password" name="confirmPassword" required />
        <button className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          Guardar contraseña
        </button>
      </form>
    </AuthPanel>
  );
}
