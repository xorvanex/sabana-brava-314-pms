"use client";

import { useState } from "react";
import {
  formatCurrency,
  formatDate,
  formatInvoiceStatus,
  formatDianStatus,
} from "@/shared/utils/invoiceLabels";
import { downloadInvoicePdf } from "@/shared/serviceGlobal/billing.services";

// Badge rendering helpers for clean visual states
function InvoiceStatusBadge({ status }) {
  const text = formatInvoiceStatus(status);
  
  let classes = "bg-slate-50 text-slate-700 border-slate-200";
  if (status === "ISSUED") {
    classes = "bg-emerald-50 text-emerald-800 border-emerald-200/60";
  } else if (status === "PENDING") {
    classes = "bg-amber-50 text-amber-800 border-amber-200/60";
  } else if (status === "CANCELLED") {
    classes = "bg-rose-50 text-rose-800 border-rose-200/60";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {text}
    </span>
  );
}

function DianStatusBadge({ status }) {
  const text = formatDianStatus(status);

  let classes = "bg-slate-50 text-slate-700 border-slate-200";
  if (status === "ACCEPTED") {
    classes = "bg-emerald-50 text-emerald-800 border-emerald-200/60";
  } else if (status === "SENT") {
    classes = "bg-blue-50 text-blue-800 border-blue-200/60";
  } else if (status === "PENDING") {
    classes = "bg-slate-50 text-slate-600 border-slate-200";
  } else if (status === "REJECTED" || status === "ERROR") {
    classes = "bg-red-50 text-red-800 border-red-200/60";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {text}
    </span>
  );
}

/**
 * Botón de descarga de PDF para una factura individual.
 * Maneja su propio estado de carga y error para no bloquear la tabla completa.
 */
function DownloadPdfButton({ invoiceId, invoiceNumber }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadInvoicePdf(invoiceId, invoiceNumber);
    } catch (err) {
      setError(err.message ?? "Error al descargar");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleDownload}
        disabled={downloading}
        title={`Descargar Factura — ${invoiceNumber}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading ? (
          <>
            {/* Spinner inline */}
            <svg
              className="h-3.5 w-3.5 animate-spin text-emerald-700"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
            Descargando...
          </>
        ) : (
          <>
            {/* Download icon */}
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Descargar Factura
          </>
        )}
      </button>

      {/* Error message below the button, only visible on failure */}
      {error && (
        <p className="text-xs text-rose-600 max-w-[130px] text-center leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

export default function InvoicesList({ invoices, companyMap = {} }) {
  if (!invoices?.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-7 py-4">Número</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-12 py-4">Periodo</th>
              <th className="px-8 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Estado Pago</th>
              <th className="px-6 py-4 text-center">DIAN</th>
              <th className="px-6 py-4 text-center">Factura PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="group transition duration-150 hover:bg-slate-50/70"
              >
                {/* Invoice number */}
                <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">
                  {inv.invoice_number}
                </td>

                {/* Company name */}
                <td className="px-6 py-4 font-medium text-slate-800">
                  {companyMap[inv.company_id] ?? "—"}
                </td>

                {/* Date range */}
                <td className="px-6 py-4 text-slate-500">
                  <div className="flex items-center gap-1 text-xs">
                    <span>{formatDate(inv.period_start)}</span>
                    <span className="text-slate-300">—</span>
                    <span>{formatDate(inv.period_end)}</span>
                  </div>
                </td>

                {/* Total amount */}
                <td className="px-6 py-4 text-right font-semibold text-emerald-800">
                  {formatCurrency(inv.total)}
                </td>

                {/* Payment status badge */}
                <td className="px-6 py-4 text-center">
                  <InvoiceStatusBadge status={inv.invoice_status} />
                </td>

                {/* DIAN status badge */}
                <td className="px-6 py-4 text-center">
                  <DianStatusBadge status={inv.dian_status} />
                </td>

                {/* Download PDF button */}
                <td className="px-6 py-4 text-center">
                  <DownloadPdfButton
                    invoiceId={inv.id}
                    invoiceNumber={inv.invoice_number}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
