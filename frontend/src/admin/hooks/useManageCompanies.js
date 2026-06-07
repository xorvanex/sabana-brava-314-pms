"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
} from "@/admin/services/admin.services";

export function useManageCompanies() {
  const [viewMode, setViewMode] = useState("consult");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar empresas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "consult") loadCompanies();
  }, [viewMode, loadCompanies]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedCompany(null);
    setError(null);
    if (mode === "consult") loadCompanies();
  };

  const handleSelectCompany = async (company) => {
    try {
      setLoading(true);
      setError(null);
      const fresh = await getCompanyById(company.id);
      setSelectedCompany(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la empresa.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCompany(null);
  };

  const handleCreate = async (form) => {
    await createCompany(form);
  };

  const handleUpdate = async (companyId, form) => {
    const updated = await updateCompany(companyId, form);
    setSelectedCompany(updated);
    await loadCompanies();
    return updated;
  };

  return {
    viewMode,
    companies,
    selectedCompany,
    loading,
    error,
    setError,
    handleViewModeChange,
    handleSelectCompany,
    handleBack,
    handleCreate,
    handleUpdate,
    loadCompanies,
  };
}