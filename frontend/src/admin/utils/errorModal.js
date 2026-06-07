export function buildErrorModalPayload(message, context = {}) {
  const msg = message ?? "Ocurrió un error inesperado.";
  const lower = msg.toLowerCase();

  if (lower.includes("nit") && (lower.includes("registrado") || lower.includes("already"))) {
    return {
      title: "NIT ya registrado",
      subtitle: "No es posible usar este NIT",
      description: (
        <>
          El NIT <strong>{context.nit || "indicado"}</strong> ya está registrado en el sistema.
        </>
      ),
      highlightValue: context.nit,
      highlightIcon: "nit",
      footerText: "Por favor, verifica el número o consulta la empresa existente.",
    };
  }

  if (lower.includes("correo") || lower.includes("email")) {
    return {
      title: "Correo ya registrado",
      subtitle: "No es posible usar este correo",
      description: (
        <>
          El correo electrónico <strong>{context.correo || context.email || "indicado"}</strong> ya está
          registrado en el sistema.
        </>
      ),
      highlightValue: context.correo || context.email,
      highlightIcon: "email",
      footerText: "Por favor, utiliza otro correo electrónico para continuar.",
    };
  }

  if (lower.includes("habitación") && lower.includes("existe")) {
    return {
      title: "Habitación duplicada",
      subtitle: "No es posible usar este número",
      description: (
        <>
          El número de habitación <strong>{context.numero || "indicado"}</strong> ya existe en el sistema.
        </>
      ),
      highlightValue: context.numero ? `Hab. ${context.numero}` : null,
      highlightIcon: "room",
      footerText: "Por favor, utiliza otro número de habitación para continuar.",
    };
  }

  if (lower.includes("contrato vigente")) {
    return {
      title: "Sin contrato vigente",
      subtitle: "No se puede generar la factura",
      description: msg,
      highlightValue: context.companyName || null,
      highlightIcon: "generic",
      footerText: "Verifica que la empresa tenga un contrato activo en el periodo seleccionado.",
    };
  }

  if (lower.includes("reserva")) {
    return {
      title: "Sin reservas facturables",
      subtitle: "No se puede generar la factura",
      description: msg,
      highlightValue: context.companyName || null,
      highlightIcon: "generic",
      footerText: "Debe existir al menos una reserva registrada en el periodo a facturar.",
    };
  }

  return {
    title: "No se pudo completar la acción",
    subtitle: "Revisa la información e intenta de nuevo",
    description: msg,
    highlightValue: null,
    highlightIcon: "generic",
    footerText: "Corrige los datos del formulario y vuelve a intentarlo.",
  };
}