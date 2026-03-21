import { connection } from "next/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return <div className="min-h-screen">{children}</div>;
}
