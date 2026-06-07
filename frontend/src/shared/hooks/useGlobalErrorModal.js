import { useState } from "react";

export function useGlobalErrorModal() {
  const [errorModal, setErrorModal] = useState(null);

  const showError = (message, context = {}) => {
    setErrorModal({ message, ...context });
  };

  const closeError = () => {
    setErrorModal(null);
  };

  return { errorModal, showError, closeError };
}