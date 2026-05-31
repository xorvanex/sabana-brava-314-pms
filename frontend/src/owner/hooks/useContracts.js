"use client";

import { useState } from "react";
import { getAllCompanies, getActiveCompanies, createContract, getAllContracts, getAllRooms, getActiveContracts } from "@/owner/services/owner.service";

export function useContracts() {
  const [companies, setCompanies] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState("create");

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getActiveCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await getAllContracts();
      setContracts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = async (company) => {
    try {
      // Verificar si hay habitaciones disponibles
      const rooms = await getAllRooms();
      const activeContracts = await getActiveContracts();
      
      // Obtener IDs de habitaciones ocupadas en contratos activos
      const occupiedRoomIds = activeContracts.flatMap(contract => 
        contract.rooms ? contract.rooms.map(room => room.id) : []
      );
      
      // Filtrar habitaciones disponibles (no ocupadas en contratos activos y con estado AVAILABLE)
      const availableRooms = rooms.filter(room => 
        !occupiedRoomIds.includes(room.id) && room.status === "AVAILABLE"
      );
      
      if (availableRooms.length === 0) {
        alert("No se pueden crear contratos: No hay habitaciones disponibles en este momento.");
        return; // No mostrar el formulario
      }
      
      setSelectedCompany(company);
      setShowContractForm(true);
    } catch (err) {
      console.error("Error al verificar habitaciones disponibles:", err);
      alert("Error al verificar disponibilidad de habitaciones. Por favor, intente nuevamente.");
    }
  };

  const handleBack = () => {
    setSelectedCompany(null);
    setShowContractForm(false);
    setPreviewData(null);
  };

  const handlePreviewGenerated = (formData) => {
    setPreviewData(formData);
    setShowPreview(true);
  };

  const handlePreviewConfirm = async () => {
    try {
      await createContract(previewData);
      setShowPreview(false);
      setShowContractForm(false);
      setSelectedCompany(null);
      setPreviewData(null);
      loadContracts();
    } catch (err) {
      alert("Error al crear contrato: " + err.message);
    }
  };

  const handlePreviewCancel = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "list") {
      loadContracts();
    } else if (mode === "create") {
      setShowContractForm(false);
      setSelectedCompany(null);
      setPreviewData(null);
    }
  };

  return {
    companies,
    contracts,
    selectedCompany,
    previewData,
    loading,
    error,
    showContractForm,
    showPreview,
    viewMode,
    loadCompanies,
    loadContracts,
    handleSelectCompany,
    handleBack,
    handlePreviewGenerated,
    handlePreviewConfirm,
    handlePreviewCancel,
    setShowContractForm,
    handleViewModeChange,
  };
}

export function useCreateContract() {
  const [formData, setFormData] = useState({
    companyId: "",
    startDate: "",
    endDate: "",
    baseRate: "",
    description: "",
    terms: "",
    roomIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    handleChange,
    handleFieldChange,
    error,
    loading,
    setFormData,
    setError,
  };
}