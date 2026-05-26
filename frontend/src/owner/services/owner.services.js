// Servicios mock por ahora (puedes conectar backend luego)

export async function getOwnerSummary() {
  return {
    totalFacturas: 128,
    contratosActivos: 12,
    usuariosActivos: 9,
  };
}