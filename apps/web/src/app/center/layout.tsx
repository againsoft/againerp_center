import { AdminThemeShell } from "@/components/providers/admin-theme-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { CenterShell } from "@/components/center/center-shell";

export default function CenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminThemeShell>
        <CenterShell>{children}</CenterShell>
      </AdminThemeShell>
    </AuthGuard>
  );
}
