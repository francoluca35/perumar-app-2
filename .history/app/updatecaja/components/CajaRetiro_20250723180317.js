"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";
import Swal from "sweetalert2";

export default function CajaRetiro() {
  const [dineroCaja, setDineroCaja] = useState(0);
  const [retiro, setRetiro] = useState("");
  const [motivo, setMotivo] = useState("");
  const [informe, setInforme] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState({});
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    fetchCaja();
    fetchInforme();

    setMostrarCierre(true);

    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const ahoraArgentina = formatter.format(new Date());

      if (ahoraArgentina.includes(":")) {
        const [horaStr, minutoStr] = ahoraArgentina.split(":");
        const horaActual = parseInt(horaStr, 10);
        const minutosActual = parseInt(minutoStr, 10);

        const enHorarioHabilitado =
          (horaActual === 8 && minutosActual >= 30) ||
          (horaActual >= 0 && horaActual < 45);

        setMostrarCierre(enHorarioHabilitado);
      } else {
        console.warn("Formato de hora inesperado:", ahoraArgentina);
        setMostrarCierre(true);
      }
    } catch (error) {
      console.error("Error al calcular horario:", error);
      setMostrarCierre(false);
    }
  }, []);
  const realizarCierreCaja = async () => {
    try {
      const res = await fetch("/api/cierre-caja", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", "Caja cerrada correctamente", "success");
        fetchCaja();
        fetchInforme();
      } else {
        Swal.fire("Error", data.error || "Ocurrió un error", "error");
      }
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  const fetchCaja = async () => {
    const res = await fetch("/api/caja-registradora");
    const data = await res.json();
    setDineroCaja(data.montoActual || 0);
  };

  const fetchInforme = async () => {
    const res = await fetch(`/api/informe-diario?page=1&limit=4`);
    const json = await res.json();

    const ordenado = Array.isArray(json.data)
      ? json.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      : [];

    setInforme(ordenado);
  };

  const checkHorario = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const ahora = formatter.format(new Date());
    const [h, m] = ahora.split(":".map(Number));
    const habilitado = (h === 23 && m >= 30) || (h >= 0 && h < 4);
    setMostrarCierre(habilitado);
  };

  const handleRetiro = async () => {
    if (!retiro || parseFloat(retiro) <= 0 || motivo.trim().length < 3) {
      return Swal.fire("Error", "Ingrese monto y motivo válido", "error");
    }
    const res = await fetch("/api/retiro-efectivo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montoRetirado: parseFloat(retiro), motivo }),
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire("Éxito", "Retiro registrado", "success");
      setRetiro("");
      setMotivo("");
      fetchCaja();
      fetchInforme();
    } else {
      Swal.fire("Error", data.error || "Ocurrió un error", "error");
    }
  };

  const descargarExcel = async (tipo) => {
    if (tipo === "todo") {
      const confirm = await Swal.fire({
        title: "¿Descargar todo el historial?",
        text: "Esto descargará todos los datos y luego los eliminará de forma permanente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;
    }

    try {
      const res = await fetch(`/api/informe/excel?tipo=${tipo}`);
      if (!res.ok) throw new Error("Error al generar Excel");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retiros-${tipo}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.fire("Éxito", "Archivo descargado correctamente", "success");
      fetchInforme(); // opcional, para refrescar después del borrado
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <header className="w-full  flex items-center gap-4 mb-8">
        <BackArrow />
        <Image
          src="/Assets/Mesas/logo-peru-mar.png"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className="text-3xl font-bold">
          PeruMar<span className="text-blue-500">.</span>
        </h1>
      </header>

      <h2 className="text-4xl font-semibold mb-6">Caja & Retiros</h2>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        <div className="flex-1 bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h3 className="text-xl mb-4 font-bold">Informe Diario</h3>
          {informe.map((item, i) => (
            <div key={i} className="mb-4 border-b border-white/20 pb-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{item.fecha}</span>
                <button
                  onClick={() =>
                    setMostrarDetalles((prev) => ({
                      ...prev,
                      [item.fecha]: !prev[item.fecha],
                    }))
                  }
                >
                  {mostrarDetalles[item.fecha] ? "−" : "+"}
                </button>
              </div>
              <div className="text-sm">
                <p>
                  Ingresos:{" "}
                  <span className="text-green-400">
                    ${item.ingresoTotal.toLocaleString()}
                  </span>
                </p>
                <p>
                  Retiros:{" "}
                  <span className="text-red-400">
                    -${item.retirosTotal.toLocaleString()}
                  </span>
                </p>
                <p>
                  Neto:{" "}
                  <span
                    className={
                      item.neto < 0 ? "text-red-400" : "text-green-400"
                    }
                  >
                    ${item.neto.toLocaleString()}
                  </span>
                </p>
                {item.cierreCaja !== null && (
                  <>
                    <p>
                      Cierre Caja:{" "}
                      <span className="text-blue-400">
                        ${item.cierreCaja.toLocaleString()}
                      </span>
                    </p>
                    {item.horaCierre && (
                      <p className="text-xs text-gray-400">
                        Hora: {item.horaCierre}
                      </p>
                    )}
                  </>
                )}
              </div>

              {mostrarDetalles[item.fecha] && item.retiros?.length > 0 && (
                <ul className="mt-2 text-xs text-gray-300 list-disc list-inside">
                  {item.retiros.map((r, j) => (
                    <li key={j}>
                      {r.hora} - ${r.monto.toLocaleString()} - {r.motivo}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => {
                if (paginaActual > 1) {
                  fetchInforme(paginaActual - 1);
                }
              }}
              disabled={paginaActual === 1}
              className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="px-2 py-1">{`Página ${paginaActual} de ${totalPaginas}`}</span>
            <button
              onClick={() => {
                if (paginaActual < totalPaginas) {
                  fetchInforme(paginaActual + 1);
                }
              }}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => descargarExcel("semana")}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Descargar Semanal
            </button>
            <button
              onClick={() => descargarExcel("mes")}
              className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600"
            >
              Descargar Mensual
            </button>
            <button
              onClick={() => descargarExcel("todo")}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Descargar Todo & Borrar
            </button>
          </div>
        </div>

        <div className="flex-1 bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h3 className="text-xl text-center font-bold mb-4">Dinero en caja</h3>
          <div className="bg-white text-black rounded-full text-center py-3 text-lg font-bold mb-6">
            ${dineroCaja.toLocaleString()}
          </div>
          <label className="block mb-2">Motivo</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ingrese el motivo"
            className="w-full px-4 py-2 mb-4 rounded bg-zinc-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="block mb-2">Retiro</label>
          <input
            type="number"
            value={retiro}
            onChange={(e) => setRetiro(e.target.value)}
            placeholder="Ingrese monto a retirar"
            className="w-full px-4 py-2 mb-4 rounded bg-zinc-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleRetiro}
            className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-300"
          >
            Retirar Efectivo
          </button>

          {mostrarCierre && (
            <button
              onClick={() => realizarCierreCaja()}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Cerrar Caja Diario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
