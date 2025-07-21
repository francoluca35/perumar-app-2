"use client";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function SelectorProductos({ productos, onSelect, onClose }) {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [filtro, setFiltro] = useState("comida");
  const [subfiltro, setSubfiltro] = useState(null);
  const [subfiltroBebida, setSubfiltroBebida] = useState(null);
  const [observacion, setObservacion] = useState(""); // <--- NUEVO

  const productosFiltrados = productos.filter((p) => {
    if (filtro === "todos") return true;

    if (filtro === "comida") {
      if (!subfiltro) return p.tipo === "comida";
      return p.tipo === "comida" && p.categoria === subfiltro;
    }

    if (filtro === "bebida") {
      if (subfiltroBebida === null) return p.tipo === "bebida";
      return p.tipo === "bebida" && p.alcohol === (subfiltroBebida === "con");
    }

    return p.tipo === filtro;
  });

  if (productoSeleccionado) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-white/10 border border-white/20 p-6 rounded-xl w-full max-w-sm text-white text-center relative">
          <button
            className="absolute top-3 right-4 text-xl"
            onClick={() => setProductoSeleccionado(null)}
          >
            <FaTimes />
          </button>

          <h4 className="text-xl font-bold mb-2">
            {productoSeleccionado.nombre}
          </h4>

          <img
            src={
              productoSeleccionado.imagen || "/Assets/comida-placeholder.jpg"
            }
            alt={productoSeleccionado.nombre}
            className="max-h-40 object-contain mx-auto mb-4 rounded"
          />

          <label className="block mb-2 text-sm font-medium">Cantidad</label>
          <input
            type="number"
            value={cantidadSeleccionada}
            min={1}
            onChange={(e) => setCantidadSeleccionada(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded bg-white/10 text-white text-center"
          />

          {/* Campo observación */}
          <label className="block mt-4 mb-2 text-sm font-medium">
            Observación <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={2}
            placeholder="Ej: Sin cebolla, bien cocido, etc."
            className="w-full px-3 py-2 rounded bg-white/10 text-white"
          />

          <button
            onClick={() => {
              onSelect({
                ...productoSeleccionado,
                cantidad: cantidadSeleccionada,
                observacion: observacion.trim() || "",
              });
              setObservacion(""); // Limpiar observación para el siguiente
              onClose();
            }}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
          >
            Agregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -top-6 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-black/90 border border-white/20 p-6 rounded-xl max-w-4xl w-full h-[85vh] overflow-y-auto text-white relative">
        <button className="absolute top-3 right-4 text-xl" onClick={onClose}>
          <FaTimes />
        </button>

        <h3 className="text-2xl font-bold mb-4 text-center">
          Seleccionar producto
        </h3>

        {/* Filtros principales */}
        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          <button
            onClick={() => {
              setFiltro("comida");
              setSubfiltro(null);
            }}
            className={`px-4 py-2 rounded-xl ${
              filtro === "comida" && !subfiltro
                ? "bg-orange-500 text-white font-bold"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            🍽 Comidas
          </button>
          <button
            onClick={() => {
              setFiltro("bebida");
              setSubfiltro(null);
            }}
            className={`px-4 py-2 rounded-xl ${
              filtro === "bebida"
                ? "bg-blue-500 text-white font-bold"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            🥤 Bebidas
          </button>
        </div>

        {/* Subfiltros solo si es comida */}
        {filtro === "comida" && (
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {[
              "brasas",
              "salteados y criollos",
              "pescados y mariscos",
              "menu diario",
              "extras",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSubfiltro(cat)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  subfiltro === cat
                    ? "bg-orange-400 text-white font-semibold"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setSubfiltro(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                subfiltro === null
                  ? "bg-orange-400 text-white font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Todas
            </button>
          </div>
        )}
        {/* Subfiltros solo si es bebida */}
        {filtro === "bebida" && (
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setSubfiltroBebida("con")}
              className={`px-3 py-1 rounded-full text-sm ${
                subfiltroBebida === "con"
                  ? "bg-blue-500 text-white font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Con alcohol
            </button>
            <button
              onClick={() => setSubfiltroBebida("sin")}
              className={`px-3 py-1 rounded-full text-sm ${
                subfiltroBebida === "sin"
                  ? "bg-blue-500 text-white font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Sin alcohol
            </button>
            <button
              onClick={() => setSubfiltroBebida(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                subfiltroBebida === null
                  ? "bg-blue-500 text-white font-semibold"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Todas
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {productosFiltrados.map((p) => (
            <button
              key={p._id}
              className="bg-white/10 border border-white/10 rounded-xl p-2 flex flex-col items-center hover:bg-white/20 transition"
              onClick={() => {
                setProductoSeleccionado(p);
                setCantidadSeleccionada(1);
                setObservacion(""); // Limpiar observación cuando cambia de producto
              }}
            >
              <img
                src={p.imagen || "/Assets/comida-placeholder.jpg"}
                alt={p.nombre}
                className="h-24 w-full object-cover rounded mb-2"
              />
              <span className="text-sm font-semibold">{p.nombre}</span>
              <span className="text-xs text-gray-300">Precio: ${p.precio}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
