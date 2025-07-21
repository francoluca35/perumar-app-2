"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function ModalEditarProducto({ producto, onClose, refetch }) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [precioConIVA, setPrecioConIVA] = useState(producto.precioConIVA);
  const [descuento, setDescuento] = useState(producto.descuento || "");
  const [tipo, setTipo] = useState(producto.tipo);
  const [categoria, setCategoria] = useState(producto.categoria || "brasas");
  const [alcohol, setAlcohol] = useState(producto.alcohol || false);
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState(producto.adicionales || []);
  const [imagen, setImagen] = useState(null);

  const handleTipoChange = (e) => {
    const nuevoTipo = e.target.value;
    setTipo(nuevoTipo);
    if (nuevoTipo === "bebida") {
      setCategoria("");
      setAdicionales([]);
    } else {
      setAlcohol(false);
    }
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

  const guardarCambios = async () => {
    const confirm = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizará el producto",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("id", producto._id);
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("precio", precio);
      formData.append("precioConIVA", precioConIVA);
      formData.append("descuento", descuento);
      if (imagen) formData.append("imagen", imagen);

      if (tipo === "comida") {
        formData.append("adicionales", JSON.stringify(adicionales));
        formData.append("categoria", categoria);
      }

      if (tipo === "bebida") {
        formData.append("alcohol", alcohol);
      }

      const res = await fetch("/api/menu/editar", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Actualizado", "Producto guardado con éxito", "success").then(
          () => {
            refetch();
            onClose();
          }
        );
      } else {
        Swal.fire("Error", data.message || "No se pudo actualizar", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Hubo un problema al guardar", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 px-4">
      <div className="bg-white text-black rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-center">
          ✏️ Editar Producto
        </h2>

        {producto.imagen && (
          <div className="flex justify-center mb-4">
            <img
              src={imagen ? URL.createObjectURL(imagen) : producto.imagen}
              alt="Imagen"
              className="w-32 h-32 object-cover rounded-xl border"
            />
          </div>
        )}

        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="w-full text-sm bg-white file:bg-green-600 file:text-white file:rounded file:px-4 file:py-1 border border-gray-300 rounded-lg"
          />

          <select
            value={tipo}
            onChange={handleTipoChange}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          >
            <option value="comida">🍽 Comida</option>
            <option value="bebida">🥤 Bebida</option>
          </select>

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            placeholder="Nombre"
          />
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            placeholder="Precio"
          />
          <input
            type="number"
            value={precioConIVA}
            onChange={(e) => setPrecioConIVA(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            placeholder="Precio con IVA"
          />
          <input
            type="number"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            placeholder="Descuento (opcional)"
          />

          {tipo === "comida" && (
            <>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              >
                <option value="brasas">🔥 Brasas</option>
                <option value="salteados y criollos">
                  🍲 Salteados y Criollos
                </option>
                <option value="pescados y mariscos">
                  🐟 Pescados y Mariscos
                </option>
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={adicional}
                  onChange={(e) => setAdicional(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  placeholder="Agregar adicional"
                />
                <button
                  onClick={agregarAdicional}
                  className="bg-green-600 text-white px-4 rounded-lg"
                >
                  +
                </button>
              </div>

              {adicionales.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-32 overflow-auto">
                  {adicionales.map((a, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-200 px-3 py-1 rounded"
                    >
                      <span>{a}</span>
                      <button
                        onClick={() => eliminarAdicional(i)}
                        className="bg-red-500 text-white px-2 py-0.5 rounded"
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tipo === "bebida" && (
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!alcohol}
                  onChange={() => setAlcohol(false)}
                />
                Sin alcohol
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={alcohol}
                  onChange={() => setAlcohol(true)}
                />
                Con alcohol
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={guardarCambios}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
