"use client";

import { useEffect } from "react";
import { useManageCompanies } from "@/admin/hooks/useManageCompanies";
import { useAdminErrorModal } from "@/admin/hooks/useAdminErrorModal";
import AdminErrorModal from "@/admin/components/ui/AdminErrorModal";
import CompanySelector from "./companySelector";
import CompanyDetailForm from "./companyDetailForm";
import RegisterCompanyForm from "./registerCompanyForm";

export default function ManageCompaniesView() {
  const {
    viewMode,
    companies,
    selectedCompany,
    loading,
    error,
    handleViewModeChange,
    handleSelectCompany,
    handleBack,
    handleCreate,
    handleUpdate,
  } = useManageCompanies();

  const { errorModal, showError, closeError } = useAdminErrorModal();

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-emerald-900">Gestionar empresas</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleViewModeChange("register")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "register" ? "bg-emerald-700 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Registrar empresa
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("consult")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "consult" ? "bg-emerald-700 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Consultar empresa
          </button>
        </div>
      </div>

      {viewMode === "register" ? (
        <RegisterCompanyForm onCreate={handleCreate} />
      ) : !selectedCompany ? (
        <CompanySelector companies={companies} loading={loading} onSelect={handleSelectCompany} />
      ) : (
        <CompanyDetailForm company={selectedCompany} loading={loading} onBack={handleBack} onUpdate={handleUpdate} />
      )}

      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </section>
  );
}