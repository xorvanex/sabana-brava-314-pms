"use client";

import { useState, useEffect } from "react";
import { getAllCompanies, createCompany } from "@/admin/services/admin.services";

export function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (companyData) => {
    try {
      await createCompany(companyData);
      await loadCompanies();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al registrar la empresa.";
      throw new Error(message);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return { companies, loading, error, handleCreate, loadCompanies };
}