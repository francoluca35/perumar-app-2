"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AbrirCaja({ visible, onClose, onUpdate }) {
  const [montoActual, setMontoActual] = useState(0);
  const [nuevoMonto, setNuevoMonto] = useState("");

  useEffect(() => {
    if (visible) {
      obtenerMontoCaja();
    }
  }, [visible]);

  const obtenerMontoCaja = async () => {
    try {
      const res = await fetch("/api/caja-registradora");
      const data = await res.json();
      setMontoActual(data.montoActual || 0);
      setNuevoMonto(data.montoActual || 0);
    } catch (err) {
      console.error("Error al obtener caja:", err);
      Swal.fire("Error", "No se pudo cargar el monto de caja", "error");
    }
  };

  const handleActualizar = async () => {
    try {
      const res = await fetch("/api/caja-registradora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: parseFloat(nuevoMonto) }),
      });

      if (res.ok) {
        Swal.fire(
          "✅ Caja actualizada",
          "El monto fue actualizado.",
          "success"
        );
        onUpdate?.(); // en caso que quieras actualizar la caja global
        onClose();
      } else {
        Swal.fire("Error", "No se pudo actualizar el monto", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error en el servidor", "error");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm text-black">
        <h2 className="text-2xl font-bold mb-4 text-center">💰 Abrir Caja</h2>

        <p className="text-center mb-4 text-lg">
          Dinero actual en caja: <b>${montoActual.toLocaleString()}</b>
        </p>

        <input
          type="number"
          className="w-full p-3 mb-4 border rounded-lg bg-gray-300"
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
        />

        <div className="flex justify-between gap-3">
          <button
            onClick={handleActualizar}
            className="bg-green-600 text-white py-2 px-4 rounded-lg w-full"
          >
            Actualizar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 py-2 px-4 rounded-lg w-full"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
