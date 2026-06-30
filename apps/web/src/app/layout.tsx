import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AdminThemeShell } from "@/components/providers/admin-theme-shell";
import { CenterShell } from "@/components/center/center-shell";
import { CenterAppProviders } from "@/components/providers/center-app-providers";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgainERP Center",
  description: "AgainSoft platform control plane — fleet, licensing, AI governance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full font-sans antialiased">
        <CenterAppProviders>
          <AdminThemeShell>
            <CenterShell>{children}</CenterShell>
          </AdminThemeShell>
        </CenterAppProviders>
      </body>
    </html>
  );
}
