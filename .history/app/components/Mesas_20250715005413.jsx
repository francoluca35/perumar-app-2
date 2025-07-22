"use client";
import { useState } from "react";
import { FaUtensils, FaUser, FaClock } from "react-icons/fa";
import useMesas from "../hooks/useMesas";
import MesaModal from "./MesaModal";

export default function Mesas() {
  const { mesas, loading, refetch } = useMesas();
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("adentroA"); // ahora 3 tipos

  if (loading) return <p className="text-white">Cargando mesas...</p>;

  // Obtener mesas según tipo seleccionado
  let mesasFiltradas = [];

  if (tipoSeleccionado === "adentroA") {
    mesasFiltradas = mesas.mesaAdentro || [];
  } else if (tipoSeleccionado === "adentroB") {
    mesasFiltradas = mesas.mesaAdentro2 || [];
  } else if (tipoSeleccionado === "afuera") {
    mesasFiltradas = mesas.mesaAfuera || [];
  }

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-white text-2xl font-bold mb-6 text-center">
        Estado de Mesas
      </h2>

      {/* Botones para cambiar entre los 3 grupos de mesas */}
      <div className="flex justify-center flex-wrap gap-4 mb-6">
        <button
          onClick={() => setTipoSeleccionado("adentroA")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            tipoSeleccionado === "adentroA"
              ? "bg-blue-800 text-white"
              : "bg-white text-black"
          }`}
        >
          Mesas Adentro A
        </button>

        <button
          onClick={() => setTipoSeleccionado("adentroB")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            tipoSeleccionado === "adentroB"
              ? "bg-blue-800 text-white"
              : "bg-white text-black"
          }`}
        >
          Mesas Adentro B
        </button>

        <button
          onClick={() => setTipoSeleccionado("afuera")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            tipoSeleccionado === "afuera"
              ? "bg-blue-800 text-white"
              : "bg-white text-black"
          }`}
        >
          Mesas Afuera
        </button>
      </div>

      {/* Grilla de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mesasFiltradas.map((mesa) => (
          <div
            key={mesa.codigo}
            onClick={() => setMesaSeleccionada(mesa)}
            className={`rounded-2xl p-4 cursor-pointer shadow-lg transition-transform hover:scale-105 duration-300 ${
              mesa.estado === "ocupado"
                ? "bg-red-600/80 text-white"
                : "bg-green-600/80 text-white"
            }`}
          >
            <h3 className="font-bold text-sm mb-2 uppercase">
              Mesa {mesa.numero}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <FaUtensils className="mb-1" />
              {mesa.productos?.[0]?.nombre || "Sin pedido"}
            </div>

            {mesa.estado === "ocupado" ? (
              <div className="flex items-center gap-2 text-sm mt-1">
                <FaClock /> {mesa.hora}
              </div>
            ) : (
              <p className="font-semibold mt-2">Disponible</p>
            )}
          </div>
        ))}

        {mesaSeleccionada && (
          <MesaModal
            mesa={mesaSeleccionada}
            onClose={() => setMesaSeleccionada(null)}
            refetch={refetch}
          />
        )}
      </div>
    </div>
  );
}
