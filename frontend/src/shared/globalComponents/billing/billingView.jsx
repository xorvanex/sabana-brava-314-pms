"use client";

import { useEffect, useMemo, useState } from "react";
import GlobalErrorModal from "@/shared/globalComponents/ui/GlobalErrorModal";
import { useGlobalErrorModal } from "@/shared/hooks/useGlobalErrorModal";
import { useConsultBilling } from "@/shared/hooks/useConsultBilling";
import InvoicesList from "./invoiceList";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";
import { formatCurrency } from "@/shared/utils/invoiceLabels";

export default function BillingView() {
  const { invoices, companies, loading, error } = useConsultBilling();
  const { errorModal, showError, closeError } = useGlobalErrorModal();
  const [companyFilter, setCompanyFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("total-desc");

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  const companyLookup = useMemo(() => {
    const map = {};
    companies.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [companies]);

  const companyMap = useMemo(() => {
    const map = {};
    companies.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [companies]);

  const filteredInvoices = useMemo(() => {
    let list = [...invoices];

    // Filter by dropdown
    if (companyFilter !== "all") {
      list = list.filter((inv) => inv.company_id === companyFilter);
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      list = list.filter((inv) => {
        const companyObj = companyLookup[inv.company_id];
        const companyName = companyObj?.name?.toLowerCase() || "";
        const companyNit = companyObj?.nit?.toLowerCase() || "";
        const invNum = inv.invoice_number?.toLowerCase() || "";
        return (
          companyName.includes(searchLower) ||
          companyNit.includes(searchLower) ||
          invNum.includes(searchLower)
        );
      });
    }

    // Sort
    return list.sort((a, b) => {
      if (sortOrder === "total-desc") {
        return Number(b.total) - Number(a.total);
      }
      if (sortOrder === "total-asc") {
        return Number(a.total) - Number(b.total);
      }
      if (sortOrder === "date-desc") {
        return new Date(b.period_end) - new Date(a.period_end);
      }
      if (sortOrder === "date-asc") {
        return new Date(a.period_end) - new Date(b.period_end);
      }
      return 0;
    });
  }, [invoices, companyFilter, searchTerm, sortOrder, companyLookup]);

  // Statistics calculation based on filtered invoices
  const stats = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;
    filteredInvoices.forEach((inv) => {
      total += Number(inv.total) || 0;
      if (inv.invoice_status === "ISSUED") paid++;
      if (inv.invoice_status === "PENDING") pending++;
    });
    return {
      totalFacturado: total,
      paidCount: paid,
      pendingCount: pending,
      totalCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  return (
    <section className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
          Consultar Facturación
        </h1>
        <p className="text-sm text-gray-500">
          Gestione y visualice el historial de cobros y estados de facturación del hotel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total revenue */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Total Facturado
            </p>
            <p className="text-xl font-bold text-emerald-900">
              {formatCurrency(stats.totalFacturado)}
            </p>
          </div>
        </div>

        {/* Total invoices */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-700">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Total Facturas
            </p>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalCount} {stats.totalCount === 1 ? "factura" : "facturas"}
            </p>
          </div>
        </div>

        {/* Paid / Issued */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Facturas Pagadas
            </p>
            <p className="text-xl font-bold text-emerald-900">
              {stats.paidCount}
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pendientes de Pago
            </p>
            <p className="text-xl font-bold text-amber-850 text-amber-900">
              {stats.pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main card with table and controls */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        
        {/* Filters and search container */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por empresa, NIT o N° de factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Select filters */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Filter by company dropdown */}
            <div className="min-w-[200px] flex-1 sm:flex-none">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="all">Todas las empresas</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.nit}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort order dropdown */}
            <div className="min-w-[180px] flex-1 sm:flex-none">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="total-desc">Mayor a menor total</option>
                <option value="total-asc">Menor a mayor total</option>
                <option value="date-desc">Más recientes primero</option>
                <option value="date-asc">Más antiguas primero</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results helper message */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-xs text-gray-500">
          <p>
            Mostrando {filteredInvoices.length} de {invoices.length} facturas
          </p>
          <p>
            Filtro: {companyFilter === "all" ? "Todas" : companyLookup[companyFilter]?.name || ""} · Orden:{" "}
            {sortOrder === "total-desc" && "Mayor a menor valor"}
            {sortOrder === "total-asc" && "Menor a mayor valor"}
            {sortOrder === "date-desc" && "Más reciente primero"}
            {sortOrder === "date-asc" && "Más antigua primero"}
          </p>
        </div>

        {/* Invoice list table section */}
        {loading ? (
          <div className="flex h-32 flex-col items-center justify-center gap-3 text-slate-400">
            <Spinner />
            <p className="text-sm">Cargando facturas...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-100 p-8 text-center text-slate-400">
            <svg
              className="h-10 w-10 text-slate-350 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium">No se encontraron facturas</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Intente cambiar el filtro por empresa o revise el término de búsqueda ingresado.
            </p>
          </div>
        ) : (
          <InvoicesList invoices={filteredInvoices} companyMap={companyMap} />
        )}
      </div>

      <GlobalErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </section>
  );
}