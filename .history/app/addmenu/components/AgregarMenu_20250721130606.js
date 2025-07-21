"use client";

import { useState, useRef } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";
import useProductos from "@/app/hooks/useProductos";
import { validarImagenMenu } from "@/utils/validationApp";
import BackArrow from "@/app/components/ui/BackArrow";
import Swal from "sweetalert2";
import ModalEditarProducto from "@/app/components/ModalEditarProducto";
import { FiPlusCircle, FiX } from "react-icons/fi";

export default function AgregarMenu() {
  const { agregarMenu, loading } = useAgregarMenu();
  const { productos, refetch } = useProductos();
  const [modo, setModo] = useState("agregar");
  const [categoria, setCategoria] = useState("brasas");

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("comida");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [alcohol, setAlcohol] = useState(false);
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState([]);
  const [file, setFile] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  const productosFiltrados = productos?.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosPaginados = productosFiltrados?.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const totalPaginas = Math.ceil(
    (productosFiltrados?.length || 0) / itemsPorPagina
  );

  const handleAgregar = async (e) => {
    e.preventDefault();

    const error = validarImagenMenu(file);
    if (error) {
      Swal.fire("Imagen no válida", error, "error");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("precio", precio);
    formData.append("descuento", descuento || "");
    formData.append(
      "adicionales",
      JSON.stringify(tipo === "comida" ? adicionales : [])
    );
    if (tipo === "bebida") {
      formData.append("alcohol", alcohol);
    } else if (tipo === "comida") {
      formData.append("categoria", categoria);
    }
    if (file) formData.append("file", file);

    await agregarMenu(formData);
    Swal.fire("Agregado", "Menú agregado correctamente.", "success");

    setNombre("");
    setPrecio("");
    setDescuento("");
    setAdicional("");
    setAdicionales([]);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(null);
    setAlcohol(false);
    refetch?.();
  };

  const agregarAdicional = () => {
    if (adicional.trim()) {
      setAdicionales([...adicionales, adicional.trim()]);
      setAdicional("");
    }
  };

  const eliminarAdicional = (index) => {
    setAdicionales(adicionales.filter((_, i) => i !== index));
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este menú será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      await fetch("/api/menu/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      Swal.fire("Eliminado", "El menú ha sido eliminado.", "success");
      refetch?.();
    } catch (error) {
      Swal.fire("Error", "Hubo un error al eliminar el menú.", "error");
    }
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 py-16 px-4">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-6 md:p-10 border border-gray-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          🍽 Gestión de Menú
        </h2>

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 rounded-xl p-1 flex justify-center gap-2 w-full md:w-auto border border-white/20">
            <button
              onClick={() => setModo("agregar")}
              className={`px-4 py-2 rounded-xl transition ${
                modo === "agregar"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Agregar Menú
            </button>
            <button
              onClick={() => setModo("editar")}
              className={`px-4 py-2 rounded-xl transition ${
                modo === "editar"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Editar / Eliminar
            </button>
          </div>
        </div>

        {modo === "agregar" && (
          <form
            onSubmit={handleAgregar}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
          >
            <div className="sm:col-span-2 flex justify-center">
              <div className="bg-white/10 rounded-xl p-1 flex justify-center gap-2 w-full sm:w-auto border border-white/20">
                <button
                  type="button"
                  onClick={() => setTipo("comida")}
                  className={`px-4 py-2 rounded-xl transition ${
                    tipo === "comida"
                      ? "bg-red-600 text-white font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  🍽 Comida
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("bebida")}
                  className={`px-4 py-2 rounded-xl transition ${
                    tipo === "bebida"
                      ? "bg-blue-600 text-white font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  🥤 Bebida
                </button>
              </div>
            </div>

            {tipo === "bebida" && (
              <div className="sm:col-span-2 flex justify-center">
                <div className="flex items-center gap-6 text-white">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="alcohol"
                      value="false"
                      checked={!alcohol}
                      onChange={() => setAlcohol(false)}
                      className="accent-cyan-600"
                    />
                    Sin alcohol
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="alcohol"
                      value="true"
                      checked={alcohol}
                      onChange={() => setAlcohol(true)}
                      className="accent-cyan-600"
                    />
                    Con alcohol
                  </label>
                </div>
              </div>
            )}

            {tipo === "comida" ? (
              <div className="sm:col-span-2 flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
                  required
                />
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full md:w-1/2 px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
                >
                  <option value="brasas" className="text-black">
                    🔥 Brasas
                  </option>
                  <option value="salteados y criollos" className="text-black">
                    🍲 Salteados y Criollos
                  </option>
                  <option value="pescados y mariscos" className="text-black">
                    🐟 Pescados y Mariscos
                  </option>
                  <option value="menu diario" className="text-black">
                    🍽️ Menu diario
                  </option>
                  <option value="extras" className="text-black">
                    🧀 Extras
                  </option>
                </select>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
                required
              />
            )}

            <input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
              required
            />

            <input
              type="number"
              placeholder="Descuento (opcional)"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
            />

            {tipo === "comida" && (
              <>
                <div className="sm:col-span-2 flex gap-3">
                  <input
                    type="text"
                    placeholder="Adicional"
                    value={adicional}
                    onChange={(e) => setAdicional(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={agregarAdicional}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 flex items-center gap-2 justify-center"
                  >
                    <FiPlusCircle /> Agregar
                  </button>
                </div>

                {adicionales.length > 0 && (
                  <div className="sm:col-span-2">
                    <ul className="list-disc pl-6 text-sm text-cyan-300">
                      {adicionales.map((a, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center"
                        >
                          {a}
                          <button
                            type="button"
                            className="ml-3 bg-red-500 text-white px-2 rounded-full"
                            onClick={() => eliminarAdicional(i)}
                          >
                            <FiX />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                const error = validarImagenMenu(selectedFile);
                if (error) {
                  Swal.fire("Archivo no válido", error, "error");
                  e.target.value = "";
                  return;
                }
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
              }}
              className="sm:col-span-2 w-full text-white text-sm file:bg-cyan-700 file:text-white file:rounded-xl file:px-4 file:py-2 bg-white/10 border border-gray-600 rounded-xl px-4 py-3"
            />
            {preview && (
              <div className="sm:col-span-2 mt-4 flex justify-center">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="h-40 object-cover rounded-xl border border-white/20"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl"
              >
                {loading ? "Agregando..." : "Agregar menú"}
              </button>
            </div>
          </form>
        )}

        {modo === "editar" && (
          <>
            <div className="mb-4 flex justify-center">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full max-w-sm px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-4">
              {productosPaginados?.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/10 text-white"
                >
                  <div>
                    <p className="font-bold">{p.nombre}</p>
                    <p className="text-sm text-cyan-300">
                      Precio: ${p.precio} / IVA: ${p.precioConIVA}
                    </p>
                    {p.tipo === "bebida" && (
                      <p className="text-sm text-yellow-400">
                        {p.alcohol ? "Con alcohol" : "Sin alcohol"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProductoEditar(p)}
                      className="bg-orange-500 hover:bg-orange-600 text-sm px-3 py-1 rounded-xl"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p._id)}
                      className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded-xl"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center items-center mt-6 gap-4">
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <span className="text-white">
                  {paginaActual} / {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl disabled:opacity-30"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {productoEditar && (
              <ModalEditarProducto
                producto={productoEditar}
                onClose={() => setProductoEditar(null)}
                refetch={refetch}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
