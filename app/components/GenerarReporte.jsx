"use client";
import { useState } from "react";

export default function GenerarReporte() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(false);

  const descargar = async () => {
    if (!desde || !hasta) {
      alert("Seleccioná ambas fechas");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/reporte?desde=${desde}&hasta=${hasta}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error en descarga");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "clientes_rango.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      alert("Error al descargar el archivo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center  text-white px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-2xl w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-white">
          Generar Reporte de Ventas
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          />
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          />
        </div>
        <button
          disabled={loading}
          onClick={descargar}
          className={`w-full flex justify-center items-center gap-3 px-6 py-3 rounded-2xl text-lg font-semibold transition-transform duration-200 ${
            loading
              ? "bg-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-400 to-blue-500 hover:scale-105 active:scale-95"
          }`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {loading ? "Generando..." : "Descargar Excel"}
        </button>
      </div>
    </div>
  );
}
