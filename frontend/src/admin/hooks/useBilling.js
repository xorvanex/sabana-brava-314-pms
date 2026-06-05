"use client";

import { useState, useEffect } from "react";
import {
  getBillingHistory,
  generateMonthlyInvoice,
  getAllCompanies,
} from "@/admin/services/admin.services";

export function useBilling() {
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
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
    }
    load();
  }, []);

  const handleGenerate = async (payload) => {
    setError(null);
    try {
      return await generateMonthlyInvoice(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo generar la factura.";
      setError(message);
      throw new Error(message);
    }
  };

  return { invoices, companies, loading, error, handleGenerate };
}