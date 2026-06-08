
"use client";

import { useState } from "react";

export default function GuestSearchCreate({
  allGuests,
  onAddGuest,
  selectedGuests,
  onRemoveGuest,
  companyId,
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    first_name: "",
    last_name: "",
    document_type: "ID_CARD",
    document_number: "",
    gender: "MALE",
    phone: "",
  });

  const filtered = allGuests.filter(
  (g) =>
    !selectedGuests.find((s) => s.id === g.id) &&
    g.company_id === companyId &&
    (`${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      g.document_number?.includes(search))
);

  const handleCreate = () => {
    if (!newGuest.first_name || !newGuest.last_name || !newGuest.document_number) {
      alert("Complete nombre y documento.");
      return;
    }
    if (!companyId) {
      alert("Debe seleccionar una empresa antes de crear un huésped.");
      return;
    }
    onAddGuest({ ...newGuest, company_id: companyId });
    setNewGuest({
      first_name: "",
      last_name: "",
      document_type: "ID_CARD",
      document_number: "",
      gender: "MALE",
      phone: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">

      {/* Buscador */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o número de documento"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Resultados de búsqueda */}
      {search.length > 0 && (
        <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-50">
          {filtered.slice(0, 8).length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No se encontraron resultados
            </div>
          ) : (
            filtered.slice(0, 8).map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {g.first_name} {g.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{g.document_number}</p>
                </div>
                <button
                  onClick={() => { onAddGuest(g); setSearch(""); }}
                  className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  Añadir
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Botón registrar nuevo */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
      >
        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-600 transition-transform ${showForm ? "rotate-45" : ""}`}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        {showForm ? "Cancelar registro" : "Registrar nuevo huésped"}
      </button>

      {/* Formulario nuevo huésped */}
      {showForm && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-emerald-800">Nuevo huésped</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nombre *"
              value={newGuest.first_name}
              onChange={(e) => setNewGuest({ ...newGuest, first_name: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Apellido *"
              value={newGuest.last_name}
              onChange={(e) => setNewGuest({ ...newGuest, last_name: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={newGuest.document_type}
              onChange={(e) => setNewGuest({ ...newGuest, document_type: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ID_CARD">Cédula</option>
              <option value="FOREIGN_ID">Cédula extranjera</option>
              <option value="PASSPORT">Pasaporte</option>
            </select>
            <input
              type="text"
              placeholder="Número de documento *"
              value={newGuest.document_number}
              onChange={(e) => setNewGuest({ ...newGuest, document_number: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={newGuest.gender}
              onChange={(e) => setNewGuest({ ...newGuest, gender: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
              <option value="OTHER">Otro</option>
            </select>
            <input
              type="text"
              placeholder="Teléfono (opcional)"
              value={newGuest.phone}
              onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Guardar huésped
          </button>
        </div>
      )}

      {/* Lista de huéspedes agregados */}
      {selectedGuests.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Huéspedes agregados ({selectedGuests.length})
          </p>
          <div className="space-y-1.5">
            {selectedGuests.map((g) => (
              <div
                key={g.id ?? g.document_number}
                className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
                    {g.first_name?.[0]}{g.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {g.first_name} {g.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{g.document_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveGuest(g.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}