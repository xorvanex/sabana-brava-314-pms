import { useEffect, useState } from "react";
import {
  getAllCompanies,
  generateMonthlyInvoice,
  getBillingHistory,
} from "@/admin/services/admin.services";

export function useBilling() {
  const [companies, setCompanies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [companiesData, invoicesData] = await Promise.all([
          getAllCompanies(),
          getBillingHistory(),
        ]);
        setCompanies(companiesData);
        setInvoices(invoicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos de facturación");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleGenerate = async ({ empresaId, mes, anio }) => {
    const invoice = await generateMonthlyInvoice({ empresaId, mes, anio });
    return invoice;
  };

  return { companies, invoices, loading, error, handleGenerate };
}