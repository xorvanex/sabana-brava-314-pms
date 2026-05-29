"use client";

import AppShell from "@/shared/globalComponents/layout/AppShell";
import { useOwner } from "@/owner/hooks/useOwner";
import { ROUTES } from "@/shared/constants/routes";

export default function OwnerLayout({ children }) {
  const { menuItems } = useOwner();

  return (
    <AppShell
      menuItems={menuItems}
      title="Owner Panel"
      dashboardHref={ROUTES.OWNER_HOME}
    >
      {children}
    </AppShell>
  );
}