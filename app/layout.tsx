import type { Metadata } from "next";
import "./globals.css";

const configuredAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: configuredAppUrl
    ? new URL(configuredAppUrl.startsWith("http") ? configuredAppUrl : `https://${configuredAppUrl}`)
    : undefined,
  title: "MOOOD",
  description: "Plataforma de bienestar, clima y comunicación organizacional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
