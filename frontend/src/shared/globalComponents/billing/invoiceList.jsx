"use client";

import {
  formatCurrency,
  formatDate,
  formatInvoiceStatus,
  formatDianStatus,
} from "@/shared/utils/invoiceLabels";

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

export default function InvoicesList({ invoices, companyMap = {} }) {
  if (!invoices?.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Número</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Periodo</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Estado Pago</th>
              <th className="px-6 py-4 text-center">DIAN</th>
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
                    <span className="text-slate-350 text-slate-300">—</span>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}