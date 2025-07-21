"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";
import Swal from "sweetalert2";

export default function CajaRetiro() {
  const [dineroCaja, setDineroCaja] = useState(0);
  const [retiro, setRetiro] = useState("");
  const [informe, setInforme] = useState([]);

  // Traer monto actual de caja
  const fetchCaja = async () => {
    try {
      const res = await fetch("/api/caja-registradora");
      const data = await res.json();
      setDineroCaja(data.montoActual || 0);
    } catch (err) {
      console.error("Error cargando caja:", err);
    }
  };

  // Traer informe diario (con ingresos de cobros efectivos)
  const fetchInforme = async () => {
    try {
      const res = await fetch("/api/informe-diario");
      const data = await res.json();

      if (!Array.isArray(data)) {
        setInforme([]);
        return;
      }

      const ordenado = data.sort((a, b) => {
        const [d1, m1, y1] = a.fecha.split("/").map(Number).reverse();
        const [d2, m2, y2] = b.fecha.split("/").map(Number).reverse();
        return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
      });

      setInforme(ordenado);
    } catch (err) {
      console.error("Error cargando informe:", err);
    }
  };

  useEffect(() => {
    fetchCaja();
    fetchInforme();
  }, []);

  const handleRetiro = async () => {
    if (!retiro || parseFloat(retiro) <= 0) {
      Swal.fire("Error", "Ingrese un monto válido", "error");
      return;
    }

    try {
      const res = await fetch("/api/retiro-efectivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoRetirado: parseFloat(retiro) }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", "Retiro realizado correctamente", "success");
        setRetiro("");
        fetchCaja();
      } else {
        Swal.fire("Error", data.error || "Ocurrió un error", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error en el servidor", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackArrow />
          <div className="flex items-center gap-3">
            <Image
              src="/Assets/Mesas/logo-peru-mar.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full border border-white shadow-sm"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">
              PeruMar<span className="text-blue-400">.</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="flex flex-col items-center justify-center mt-10 px-4">
        <h2 className="text-white text-3xl font-semibold mb-10">
          Historial & Retiro
        </h2>

        <div className="bg-black/50 p-6 rounded-xl flex flex-col md:flex-row gap-10">
          {/* Informe diario */}
          <div className="bg-white/10 p-4 rounded-lg border border-blue-400 w-[300px]">
            <h3 className="text-white text-xl text-center mb-4">
              Informe Diario
            </h3>
            <table className="w-full text-center text-white text-sm">
              <thead>
                <tr className="border-b border-white">
                  <th>Fecha</th>
                  <th>Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {informe.slice(0, 7).map((item, index) => (
                  <tr key={index} className="border-b border-white">
                    <td>{item.fecha}</td>
                    <td>${item.ingresoTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-center mt-2 text-blue-300 font-semibold hover:underline cursor-pointer">
              Ver más
            </div>
          </div>

          {/* Retiro de caja */}
          <div className="bg-white/10 p-6 rounded-lg w-[300px]">
            <h3 className="text-white text-xl text-center mb-4">
              Dinero en caja
            </h3>

            <div className="bg-gray-300 rounded-full text-center py-3 text-black font-bold mb-6">
              ${dineroCaja.toLocaleString()}
            </div>

            <label className="text-white mb-2 block">Retiro</label>
            <input
              type="number"
              placeholder="Ingrese monto a retirar"
              value={retiro}
              onChange={(e) => setRetiro(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleRetiro}
              className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all"
            >
              Retirar Efectivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
