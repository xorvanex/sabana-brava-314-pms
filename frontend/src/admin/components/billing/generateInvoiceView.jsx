"use client";

import { useState } from "react";
import { useBilling } from "@/admin/hooks/useBilling";
import Button from "@/shared/globalComponents/ui/button/Button";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

export default function GenerateInvoiceView() {

  const { companies, loading, handleGenerate } = useBilling();
  const [empresaId, setEmpresaId] = useState("");
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);
    try {
      await handleGenerate({ empresaId, mes: Number(mes), anio: Number(anio) });
      setMessage("Factura generada correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">Generar factura mensual</h1>
      <p className="text-sm text-gray-600">
        Genera la facturación mensual por empresa contratante.
      </p>

      <div className="max-w-lg rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Cargando empresas...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Empresa</label>
              <select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Seleccionar empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} — {c.nit}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mes</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Año</label>
                <input
                  type="number"
                  min={2000}
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Generando...
                </span>
              ) : (
                "Generar factura"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}