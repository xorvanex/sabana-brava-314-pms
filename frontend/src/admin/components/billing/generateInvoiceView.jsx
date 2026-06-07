"use client";

import { useEffect, useState } from "react";
import AdminErrorModal from "@/admin/components/ui/AdminErrorModal";
import AdminInfoBanner from "@/admin/components/ui/AdminInfoBanner";
import AdminSuccessBanner from "@/admin/components/ui/AdminSuccessBanner";
import { useAdminErrorModal } from "@/admin/hooks/useAdminErrorModal";
import { validateInvoiceForm } from "@/admin/utils/parseApiError";
import { formatInvoiceStatus } from "@/admin/utils/formatLabels";
import { useBilling } from "@/admin/hooks/useBilling";
import Button from "@/shared/globalComponents/ui/button/Button";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

export default function GenerateInvoiceView() {
  const { companies, loading, error, handleGenerate } = useBilling();
  const { errorModal, showError, closeError } = useAdminErrorModal();
  const [empresaId, setEmpresaId] = useState("");
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  const selectedCompany = companies.find((c) => c.id === empresaId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    const validationError = validateInvoiceForm({ empresaId, mes, anio });
    if (validationError) {
      showError(validationError, { companyName: selectedCompany?.name });
      return;
    }

    setSaving(true);
    try {
      const invoice = await handleGenerate({
        empresaId,
        mes: Number(mes),
        anio: Number(anio),
      });
      setSuccess(
        `Factura ${invoice.invoice_number} generada. Estado: ${formatInvoiceStatus(invoice.invoice_status)}.`
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo generar la factura.", {
        companyName: selectedCompany?.name,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">Generar factura mensual</h1>

      <AdminInfoBanner>
        Requisitos: al menos una reserva en el mes y un contrato vigente. Las facturas nuevas deben quedar en estado{" "}
        <strong>pendiente de pago</strong> (<code>PENDING</code> en API).
      </AdminInfoBanner>

      <div className="max-w-lg rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
        <AdminSuccessBanner message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner />
            Cargando empresas...
          </p>
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
                    {c.name} — {c.nit}
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

      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </section>
  );
}