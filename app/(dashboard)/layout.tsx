import { connection } from "next/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { signOutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireUser();

  if (user.role === "employee") {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f9f6fb_55%,#ffffff_100%)]">
        <header className="border-b bg-white/90 px-4 py-4 backdrop-blur">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">{user.full_name}</p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>

              <form action={signOutAction}>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="min-w-0 flex-1">
        <Topbar user={user} />
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
