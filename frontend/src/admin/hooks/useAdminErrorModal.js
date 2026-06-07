"use client";

import { useState, useCallback } from "react";
import { buildErrorModalPayload } from "@/admin/utils/errorModal";

export function useAdminErrorModal() {
  const [errorModal, setErrorModal] = useState(null);

  const showError = useCallback((message, context = {}) => {
    setErrorModal(buildErrorModalPayload(message, context));
  }, []);

  const closeError = useCallback(() => {
    setErrorModal(null);
  }, []);

  return { errorModal, showError, closeError }; 
}