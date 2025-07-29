"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import QRCode from "react-qr-code";

export default function RestauranteForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [pago, setPago] = useState("");
  const [urlPago, setUrlPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [presupuesto, setPresupuesto] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [esperandoPago, setEsperandoPago] = useState(false);
  const [comisionMP, setComisionMP] = useState(0);
  const [totalMP, setTotalMP] = useState(0);

  // Observación general del pedido (para el repartidor)
  const [observacion, setObservacion] = useState("");
  // Observación por producto (para ticket/cocina)
  const [observacionProducto, setObservacionProducto] = useState("");

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularTotal = () => {
    return presupuesto.reduce((total, item) => {
      const comidaProd = productos.find((p) => p.nombre === item.comida);
      const bebidaProd = productos.find((p) => p.nombre === item.bebida);
      const base = (comidaProd?.precio || 0) * (item.cantidad || 1);
      const bebidaPrecio = (bebidaProd?.precio || 0) * (item.cantidad || 1);
      return total + base + bebidaPrecio;
    }, 0);
  };

  const total = calcularTotal();

  useEffect(() => {
    setTotalMP(Math.round((Number(total) + Number(comisionMP)) * 100) / 100);
  }, [total, comisionMP]);

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad < 1) return;
    const tipo = productos.find((p) => p.nombre === productoSeleccionado)?.tipo;
    setPresupuesto((prev) => [
      ...prev,
      {
        comida: tipo !== "bebida" ? productoSeleccionado : "",
        bebida: tipo === "bebida" ? productoSeleccionado : "",
        cantidad,
        observacion: observacionProducto, // Observación por producto
      },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
    setBusqueda("");
    setObservacionProducto("");
  };

  const eliminarItem = (index) => {
    setPresupuesto((prev) => prev.filter((_, i) => i !== index));
  };

  // Adaptar QR para sumar la comision
  const generarPagoQR = async () => {
    const res = await fetch("/api/mercado-pago/crear-pago-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: totalMP, // Incluye la comisión
        nombreCliente: nombre || "Cliente",
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setUrlPago(data.init_point);
      setExternalReference(data.external_reference);
      setEsperandoPago(true);
      esperarConfirmacionPago(data.external_reference);
    } else {
      Swal.fire("Error", "No se pudo generar el QR", "error");
    }
  };

  const esperarConfirmacionPago = (ref) => {
    let intentos = 0;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/mercado-pago/estado/${ref}`);
      const data = await res.json();

      if (data.status === "approved") {
        clearInterval(interval);
        setEsperandoPago(false);
        enviarPedidoFinal();
      }

      intentos++;
      if (intentos >= 24) {
        clearInterval(interval);
        setEsperandoPago(false);
        Swal.fire("Pago no confirmado", "Intenta nuevamente", "error");
      }
    }, 5000);
  };

  const enviarPedidoFinal = async () => {
    const now = new Date();
    const hora = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = now.toLocaleDateString("es-AR");

    const payload = {
      modoPedido: "restaurante",
      tipo: "entregalocal",
      nombre,
      observacion, // Observación general para el repartidor
      formaDePago: pago,
      comidas: presupuesto,
      total: pago === "qr" ? totalMP : total,
      comision: pago === "qr" ? comisionMP : 0,
      modo: "retiro",
      estado: "en curso",
      fecha: now.toLocaleString("es-AR"),
      timestamp: now,
    };

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const productosParaImprimir = presupuesto.map((item) => ({
          nombre: item.comida || item.bebida,
          cantidad: item.cantidad,
          observacion: item.observacion, // Para ticket/cocina
        }));

        await fetch("/api/print/envios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            productos: productosParaImprimir,
            total: pago === "qr" ? totalMP : total,
            hora,
            fecha,
            metodoPago: pago,
            modo: "retiro",
          }),
        });

        Swal.fire("Pedido enviado correctamente", "", "success");
        resetFormulario();
      } else {
        Swal.fire("Error", "No se pudo enviar el pedido", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Hubo un problema al enviar", "error");
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setBusqueda("");
    setProductoSeleccionado("");
    setCantidad(1);
    setPago("");
    setPresupuesto([]);
    setUrlPago("");
    setExternalReference("");
    setEsperandoPago(false);
    setComisionMP(0);
    setObservacion("");
    setObservacionProducto("");
  };

  const manejarPedido = () => {
    if (!nombre || presupuesto.length === 0 || !pago) {
      Swal.fire("Completa todos los campos", "", "warning");
      return;
    }

    if (pago === "efectivo") {
      enviarPedidoFinal();
    } else if (pago === "qr") {
      generarPagoQR();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
      {/* LADO IZQUIERDO */}
      <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-xl">
        {/* Productos */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Buscar comida o bebida..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarDropdown(true);
            }}
            onFocus={() => setMostrarDropdown(true)}
            className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
          />
          {mostrarDropdown && productosFiltrados.length > 0 && (
            <ul className="absolute z-10 w-full bg-white text-black rounded-xl shadow-md max-h-40 overflow-y-auto">
              {productosFiltrados.map((p) => (
                <li
                  key={p._id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setProductoSeleccionado(p.nombre);
                    setBusqueda(p.nombre);
                    setMostrarDropdown(false);
                  }}
                >
                  {p.nombre}
                </li>
              ))}
            </ul>
          )}

          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className=" px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20"
          />
          {/* Observación por producto */}
          <input
            type="text"
            placeholder="Obs. para cocina (opcional)"
            value={observacionProducto}
            onChange={(e) => setObservacionProducto(e.target.value)}
            className=" px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20"
          />

          <button
            onClick={agregarProducto}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mt-2"
          >
            <div className="flex items-center justify-center gap-2">
              <FiPlusCircle /> Agregar producto
            </div>
          </button>
        </div>

        {/* Resumen de productos */}
        {presupuesto.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Resumen:
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {presupuesto.map((item, index) => (
                <li key={index} className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span>
                      {item.cantidad}x {item.comida || item.bebida}
                    </span>
                    <button
                      onClick={() => eliminarItem(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  {item.observacion && (
                    <div className="ml-2 text-cyan-300 italic text-xs">
                      📝 {item.observacion}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* LADO DERECHO */}
      <div className="flex flex-col gap-6 bg-black/10 p-6 rounded-xl">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
          placeholder="Nombre del cliente"
        />

        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option className="text-black" value="">
            Forma de pago
          </option>
          <option className="text-black" value="efectivo">
            Efectivo
          </option>
          <option className="text-black" value="qr">
            Mercado Pago QR
          </option>
        </select>

        {/* Solo mostrar campo comisión si se elige QR */}
        {pago === "qr" && (
          <div className="mb-4 text-center">
            <label className="block text-gray-300 font-bold text-center mb-2">
              Agregar comisión Mercado Pago
            </label>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-gray-700 text-sm">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={comisionMP === 0 ? "" : comisionMP}
                onChange={(e) => {
                  let value = e.target.value;
                  if (
                    value.startsWith("0") &&
                    value.length > 1 &&
                    !value.startsWith("0.")
                  ) {
                    value = value.replace(/^0+/, "");
                  }
                  const floatValue = parseFloat(value);
                  setComisionMP(isNaN(floatValue) ? 0 : floatValue);
                }}
                className="w-24 border px-2 py-1 rounded text-center"
                placeholder="0.00"
              />
              <span className="text-gray-700 text-xs">(opcional)</span>
            </div>
            <div className="text-center mt-1 mb-2">
              <span className="text-gray-800 font-bold">
                Total a cobrar: ${totalMP.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {pago === "qr" && urlPago && (
          <div className="flex flex-col items-center gap-2 mb-4">
            <QRCode value={urlPago} size={200} />
            {esperandoPago && (
              <p className="text-sm text-white mt-2">
                Esperando confirmación de pago...
              </p>
            )}
          </div>
        )}

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>

        <button
          onClick={manejarPedido}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl"
        >
          Hacer Pedido
        </button>
      </div>
    </div>
  );
}
