"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getBillingHistory,
  getAllCompanies,
} from "@/shared/serviceGlobal/billing.services";

export function useConsultBilling() {
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [billing, comps] = await Promise.all([
        getBillingHistory(),
        getAllCompanies(),
      ]);
      setInvoices(billing);
      setCompanies(comps);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la información de facturación."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { invoices, companies, loading, error, reload };
}