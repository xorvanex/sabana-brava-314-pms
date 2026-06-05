"use client";

import { useState, useEffect, useRef } from "react";
import { previewContractPDF, createContract } from "@/owner/services/owner.service";
import Button from "@/shared/globalComponents/ui/button/Button";

export default function ContractPreviewModal({ previewData, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [error, setError] = useState(null);
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
        setError(null);
      } catch (err) {
        console.error("Error al descargar preview PDF:", err);
        let errorMessage = err.message || "Error al generar el PDF del contrato";
        
        // Parsear error específico del backend
        if (errorMessage.includes("Rooms already assigned")) {
          const roomNumbers = errorMessage.match(/\d+/g)?.join(", ") || "";
          errorMessage = `Las habitaciones ${roomNumbers} ya están asignadas a otro contrato activo. Por favor, selecciona otras habitaciones.`;
        } else if (errorMessage.includes("overlapping")) {
          errorMessage = "La empresa ya tiene un contrato activo con fechas que se superponen. Por favor, selecciona otras fechas.";
        }
        
        setError(errorMessage);
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
          {error ? (
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <svg className="h-16 w-16 mx-auto text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-900 font-medium mb-2">
                  Error al generar el PDF del contrato
                </p>
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
              
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          ) : pdfGenerated ? (
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