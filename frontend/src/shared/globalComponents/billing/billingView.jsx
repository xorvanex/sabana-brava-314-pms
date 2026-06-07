"use client";

import { useEffect, useMemo, useState } from "react";
import GlobalErrorModal from "@/shared/globalComponents/ui/GlobalErrorModal";
import { useGlobalErrorModal } from "@/shared/hooks/useGlobalErrorModal";
import { useConsultBilling } from "@/shared/hooks/useConsultBilling";
import InvoicesList from "./invoiceList";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

export default function BillingView() {
  const { invoices, companies, loading, error } = useConsultBilling();
  const { errorModal, showError, closeError } = useGlobalErrorModal();
  const [companyFilter, setCompanyFilter] = useState("all");

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  const companyMap = useMemo(() => {
    const map = {};
    companies.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [companies]);

  const filteredInvoices = useMemo(() => {
    let list = [...invoices];
    if (companyFilter !== "all") {
      list = list.filter((inv) => inv.company_id === companyFilter);
    }
    return list.sort((a, b) => Number(b.total) - Number(a.total));
  }, [invoices, companyFilter]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">Consultar facturación</h1>
      <p className="text-sm text-gray-600">Historial ordenado de mayor a menor costo.</p>

      <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">Filtrar por empresa</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.nit}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">
            {filteredInvoices.length} factura(s) · orden: mayor a menor total
          </p>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Cargando facturación...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-gray-500">No hay facturas para el filtro seleccionado.</p>
        ) : (
          <InvoicesList invoices={filteredInvoices} companyMap={companyMap} />
        )}
      </div>

      <GlobalErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </section>
  );
}