import Link from "next/link";
import { connection } from "next/server";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/lib/auth/actions";
import { hasEnvVars } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await connection();
  const params = await searchParams;

  return (
    <AuthPanel
      eyebrow="Acceso MOOOD"
      title="Iniciar sesión"
      description=""
      footer={
        <div className="flex items-center justify-between">
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Recuperar contraseña
          </Link>
        </div>
      }
    >
      <AuthMessage error={params.error} success={params.success} />
      <form action={signInAction} className="space-y-4">
        <Input placeholder="correo@empresa.com" type="email" name="email" required />
        <Input placeholder="Contraseña" type="password" name="password" required />
        <button className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          Entrar
        </button>
      </form>
    </AuthPanel>
  );
}
