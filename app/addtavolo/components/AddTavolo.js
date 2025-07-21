"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BackArrow from "@/app/components/ui/BackArrow";

export default function AddTavolo() {
  const [tipoAgregar, setTipoAgregar] = useState("");
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
  const [tipoEliminar, setTipoEliminar] = useState("");
  const [cantidadEliminar, setCantidadEliminar] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [mesasAdentro, setMesasAdentro] = useState([]);
  const [mesasAdentro2, setMesasAdentro2] = useState([]);
  const [mesasAfuera, setMesasAfuera] = useState([]);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch("/api/mesas");
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          setMesasAdentro(data[0].mesaAdentro);
          setMesasAdentro2(data[0].mesaAdentro2);
          setMesasAfuera(data[0].mesaAfuera);
        }
      } catch (err) {
        console.error("Error cargando mesas:", err);
      }
    };
    fetchMesas();
  }, []);

  const handleAgregar = async () => {
    if (!tipoAgregar) {
      setMensaje("Seleccioná un tipo de mesa para agregar");
      return;
    }

    const res = await fetch("/api/mesas/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tipoAgregar,
        cantidad: parseInt(cantidadAgregar),
      }),
    });

    if (res.ok) {
      Swal.fire("Agregado", "Mesas agregadas correctamente", "success").then(
        () => location.reload()
      );
    } else {
      setMensaje("Error al agregar mesas");
    }
  };

  const eliminarMesasSeleccionadas = async () => {
    if (seleccionadas.length === 0) return;

    const confirm = await Swal.fire({
      title: "¿Eliminar mesas seleccionadas?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch("/api/mesas/eliminar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigos: seleccionadas }),
    });

    if (res.ok) {
      Swal.fire("Eliminadas", "Mesas eliminadas correctamente", "success").then(
        () => location.reload()
      );
    }
  };

  const eliminarPorCantidad = async () => {
    if (!tipoEliminar || cantidadEliminar <= 0) return;

    const confirm = await Swal.fire({
      title: "¿Eliminar cantidad de mesas?",
      text: `${cantidadEliminar} mesas de tipo ${tipoEliminar}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch("/api/mesas/eliminar-cantidad", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tipoEliminar,
        cantidad: parseInt(cantidadEliminar),
      }),
    });

    if (res.ok) {
      Swal.fire("Listo", "Mesas eliminadas", "success").then(() =>
        location.reload()
      );
    }
  };

  const toggleSeleccion = (codigo) => {
    setSeleccionadas((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo]
    );
  };

  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-red-600 via-black to-blue-950 text-white">
      <div className="max-w-xl mx-auto border border-white/20 rounded-2xl p-6 bg-white/5 backdrop-blur-xl">
        <BackArrow label="Volver al panel" />
        <h2 className="text-3xl font-bold mb-6 text-center">
          ➕ Agregar / Eliminar Mesas
        </h2>

        <div className="space-y-4">
          <select
            value={tipoAgregar}
            onChange={(e) => setTipoAgregar(e.target.value)}
            className="w-full bg-white/10 text-white px-4 py-2 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className=" text-black" value="">
              -- Tipo de mesa a agregar --
            </option>
            <option className=" text-black" value="mesaAdentro">
              🍽 Adentro A
            </option>
            <option className=" text-black" value="mesaAdentro2">
              🍽 Adentro B
            </option>
            <option className=" text-black" value="mesaAfuera">
              🌤 Afuera
            </option>
          </select>

          <input
            type="number"
            min={1}
            value={cantidadAgregar}
            onChange={(e) => setCantidadAgregar(e.target.value)}
            className="w-full bg-white/10 px-4 py-2 rounded-xl"
            placeholder="Cantidad"
          />

          <button
            onClick={handleAgregar}
            className="w-full py-3 bg-green-600 rounded-xl font-bold"
          >
            Agregar Mesas
          </button>

          <hr className="my-6 border-white/30" />

          <button
            onClick={() => setMostrarEliminar(!mostrarEliminar)}
            className="w-full py-3 bg-red-600 rounded-xl font-bold"
          >
            🗑 Eliminar Mesas
          </button>

          {mostrarEliminar && (
            <div className="space-y-4 mt-4">
              <h4 className="text-lg font-semibold">Eliminar por cantidad</h4>
              <select
                value={tipoEliminar}
                onChange={(e) => setTipoEliminar(e.target.value)}
                className="w-full bg-white/10 px-4 py-2 rounded-xl"
              >
                <option className=" text-black" value="">
                  -- Tipo de mesa a eliminar --
                </option>
                <option className=" text-black" value="mesaAdentro">
                  🍽 Adentro A
                </option>
                <option className=" text-black" value="mesaAdentro2">
                  🍽 Adentro B
                </option>
                <option className=" text-black" value="mesaAfuera">
                  🌤 Afuera
                </option>
              </select>
              <input
                type="number"
                min={1}
                value={cantidadEliminar}
                onChange={(e) => setCantidadEliminar(e.target.value)}
                className="w-full bg-white/10 px-4 py-2 rounded-xl"
                placeholder="Cantidad"
              />
              <button
                onClick={eliminarPorCantidad}
                className="w-full py-3 bg-red-700 rounded-xl"
              >
                Eliminar Cantidad
              </button>

              <h4 className="text-lg font-semibold mt-6">
                Eliminar por selección
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {[...mesasAdentro, ...mesasAdentro2, ...mesasAfuera].map(
                  (mesa) => (
                    <button
                      key={mesa.codigo}
                      onClick={() => toggleSeleccion(mesa.codigo)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                        seleccionadas.includes(mesa.codigo)
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-white/10 text-white border-white/20"
                      }`}
                    >
                      {mesa.numero}
                    </button>
                  )
                )}
              </div>

              {seleccionadas.length > 0 && (
                <button
                  onClick={eliminarMesasSeleccionadas}
                  className="w-full mt-4 py-2 bg-red-800 rounded-xl font-bold"
                >
                  Confirmar eliminación seleccionadas
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
