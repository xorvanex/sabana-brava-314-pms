"use client";

import { useContracts } from "@/owner/hooks/useContracts";
import CompanySelector from "./companySelector";
import ContractForm from "./contractForm";
import ContractPreviewModal from "./contractPreviewModal";
import ContractsList from "./contractsList";

export default function ContractsView() {
  const {
    selectedCompany,
    showContractForm,
    showPreview,
    previewData,
    viewMode,
    contracts,
    loading,
    error,
    handleSelectCompany,
    handleBack,
    handlePreviewGenerated,
    handlePreviewConfirm,
    handlePreviewCancel,
    setShowContractForm,
    handleViewModeChange,
    loadContracts,
  } = useContracts();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-emerald-900">
            Gestión de contratos
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleViewModeChange("create")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "create"
                ? "bg-emerald-700 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Ver empresas 
          </button>
          <button
            onClick={() => handleViewModeChange("list")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "list"
                ? "bg-emerald-700 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Consultar contratos
          </button>
        </div>
      </div>

      {viewMode === "create" ? (
        !showContractForm ? (
          <CompanySelector onSelect={handleSelectCompany} />
        ) : (
          <ContractForm
            company={selectedCompany}
            onBack={handleBack}
            onPreviewGenerated={handlePreviewGenerated}
          />
        )
      ) : (
        <ContractsList 
          contracts={contracts} 
          loading={loading} 
          error={error} 
          onRefresh={loadContracts}
        />
      )}

      {showPreview && previewData && (
        <ContractPreviewModal
          previewData={previewData}
          onClose={handlePreviewCancel}
          onConfirm={handlePreviewConfirm}
        />
      )}
    </section>
  );
}