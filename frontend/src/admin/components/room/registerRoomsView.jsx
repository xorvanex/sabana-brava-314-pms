"use client";

import { useState } from "react";
import { useRooms } from "@/admin/hooks/useRooms";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

const EMPTY_FORM = { numero: "", descripcion: "" };

export default function RegisterRoomView() {
  const { rooms, loading, error, handleCreate } = useRooms();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await handleCreate({
        numero: form.numero,
        descripcion: form.descripcion || null,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-emerald-900">
        Registrar habitación
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-emerald-900">Nueva habitación</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Número de habitación"
              id="numero"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              placeholder="Ej. 101"
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción (opcional)
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Registrando...
                </span>
              ) : (
                "Registrar habitación"
              )}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-emerald-900">Habitaciones registradas</h2>
          {error && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : rooms.length === 0 ? (
            <p className="text-sm text-gray-500">No hay habitaciones registradas.</p>
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium">Hab. {room.room_number}</span>
                  <span className="ml-2 text-gray-500">{room.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}