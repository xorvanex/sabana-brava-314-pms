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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
            Gestionar Empresas
          </h1>
          <p className="text-sm text-gray-500">
            Administre los datos y configuraciones de las empresas asociadas.
          </p>
        </div>
        <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-xl w-fit self-start sm:self-center border border-slate-200/50">
          <button
            type="button"
            onClick={() => handleViewModeChange("register")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === "register"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Registrar empresa
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("consult")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === "consult"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
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