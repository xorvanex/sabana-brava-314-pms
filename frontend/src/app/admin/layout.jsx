"use client";

import AppShell from "@/shared/globalComponents/layout/AppShell";
import { useAdmin } from "@/admin/hooks/useAdmin";
import { ROUTES } from "@/shared/constants/routes";

export default function AdminLayout({ children }) {
  const { menuItems } = useAdmin();

  return (
    <AppShell
      menuItems={menuItems}
      title="Admin Panel"
      dashboardHref={ROUTES.ADMIN_HOME}
    >
      {children}
    </AppShell>
  );
}