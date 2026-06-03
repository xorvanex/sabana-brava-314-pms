"use client";

import AppShell from "@/shared/globalComponents/layout/AppShell";
import { useReceptionist } from "@/receptionist/hooks/useReceptionist";
import { ROUTES } from "@/shared/constants/routes";

export default function ReceptionistLayout({ children }) {
  const { menuItems } = useReceptionist();

  return (
    <AppShell
      menuItems={menuItems}
      title="Panel Recepcionista"
      dashboardHref={ROUTES.RECEPTIONIST_HOME}
    >
      {children}
    </AppShell>
  );
}