import { redirect } from "next/navigation";
import { connection } from "next/server";
import { signOutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireUser();

  if (!user.is_platform_admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-shell">
      <header className="border-b bg-white/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin global</p>
            <h1 className="text-xl font-semibold">MOOOD Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <form action={signOutAction}>
              <button className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-foreground">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
