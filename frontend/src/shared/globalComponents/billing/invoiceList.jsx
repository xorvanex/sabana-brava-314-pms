"use client";

import {
  formatCurrency,
  formatDate,
  formatInvoiceStatus,
  formatDianStatus,
} from "@/shared/utils/invoiceLabels";

export default function InvoicesList({ invoices, companyMap = {} }) {
  if (!invoices?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2 pr-4">Número</th>
            <th className="py-2 pr-4">Empresa</th>
            <th className="py-2 pr-4">Periodo</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Estado pago</th>
            <th className="py-2">DIAN</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-100">
              <td className="py-3 pr-4 font-medium text-gray-900">{inv.invoice_number}</td>
              <td className="py-3 pr-4 text-gray-600">{companyMap[inv.company_id] ?? "—"}</td>
              <td className="py-3 pr-4 text-gray-600">
                {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
              </td>
              <td className="py-3 pr-4 font-semibold text-emerald-800">{formatCurrency(inv.total)}</td>
              <td className="py-3 pr-4">{formatInvoiceStatus(inv.invoice_status)}</td>
              <td className="py-3">{formatDianStatus(inv.dian_status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}