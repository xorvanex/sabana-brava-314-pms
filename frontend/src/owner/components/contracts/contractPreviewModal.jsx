"use client";

import { useState, useEffect, useRef } from "react";
import { previewContractPDF, createContract } from "@/owner/services/owner.service";
import Button from "@/shared/globalComponents/ui/button/Button";

export default function ContractPreviewModal({ previewData, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const hasDownloaded = useRef(false);
  const isCreating = useRef(false);

  useEffect(() => {
    const downloadPdf = async () => {
      if (hasDownloaded.current) return;
      hasDownloaded.current = true;

      try {
        const blob = await previewContractPDF(previewData);
        
        if (blob.size === 0) {
          throw new Error("El PDF está vacío");
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "preview_contrato.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setPdfGenerated(true);
      } catch (err) {
        console.error("Error al descargar preview PDF:", err);
      }
    };
    
    downloadPdf();
  }, [previewData]);

  const handleConfirm = async () => {
    if (loading || isCreating.current) return;
    isCreating.current = true;
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      const errorMessage = err.message || "Error al crear contrato";
      
      // Manejar error de superposición en español
      if (errorMessage.includes("overlapping dates")) {
        alert("La empresa ya tiene un contrato activo con fechas que se superponen. Por favor, selecciona otras fechas.");
      } else {
        alert("Error al crear contrato: " + errorMessage);
      }
    } finally {
      setLoading(false);
      isCreating.current = false;
    }
  };

  const handleRedownload = async () => {
    try {
      const blob = await previewContractPDF(previewData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "preview_contrato.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al descargar PDF: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Preview del Contrato
            </h2>
            <p className="text-sm text-gray-500">
              El PDF se ha descargado automáticamente
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {pdfGenerated ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <svg className="h-16 w-16 mx-auto text-emerald-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-emerald-900 font-medium mb-2">
                  El PDF del contrato se ha descargado
                </p>
                <p className="text-sm text-emerald-700">
                  Revisa el archivo descargado y regresa aquí para confirmar la creación del contrato
                </p>
              </div>
              
              <Button
                type="button"
                onClick={handleRedownload}
                variant="outline"
                className="w-full"
              >
                Descargar PDF nuevamente
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 mx-auto" />
              <p className="text-gray-500">Generando y descargando PDF...</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !pdfGenerated}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            {loading ? "Creando contrato..." : "Confirmar y crear contrato"}
          </Button>
        </div>
      </div>
    </div>
  );
}