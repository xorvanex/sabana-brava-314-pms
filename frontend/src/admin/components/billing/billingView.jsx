"use client";

import { useBilling } from "@/admin/hooks/useBilling";

export default function BillingView() {
  const { invoices, loading, error } = useBilling();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">Consultar facturación</h1>
      <p className="text-sm text-gray-600">Historial de facturas emitidas.</p>

      <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Cargando facturación...</p>
        ) : invoices.length === 0 ? (
          <p className="text-gray-500">
            No hay facturas registradas. El módulo de facturación se conectará cuando el backend exponga el endpoint.
          </p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                {inv.referencia ?? inv.id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}