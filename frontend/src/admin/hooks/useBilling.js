import { useEffect, useState } from "react";
import {
  getAllCompanies,
  getContractsByCompany,
  getReservationsByCompany,
  generateMonthlyInvoice,
} from "@/admin/services/admin.services";

export function useBilling() {
  const [companies, setCompanies] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllCompanies()
      .then(setCompanies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const loadContracts = async (companyId) => {
    setContracts([]);
    setReservations([]);
    setLoadingContracts(true);
    try {
      const data = await getContractsByCompany(companyId);
      setContracts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingContracts(false);
    }
  };

  const loadReservations = async (companyId) => {
    setReservations([]);
    setLoadingReservations(true);
    try {
      const data = await getReservationsByCompany(companyId);
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleGenerate = async ({ empresaId, period_start, period_end }) => {
    return generateMonthlyInvoice({ empresaId, period_start, period_end });
  };

  return {
    companies, contracts, reservations,
    loading, loadingContracts, loadingReservations,
    error, loadContracts, loadReservations, handleGenerate,
  };
}