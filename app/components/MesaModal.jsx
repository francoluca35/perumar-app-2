"use client";

import { useEffect, useState } from "react";
import useProductos from "../hooks/useProductos";
import Swal from "sweetalert2";
import Resumen from "./Resumen";
import CobrarCuentaModal from "../cobrarCuenta/component/CobrarCuentaModal";
import SelectorProductos from "../components/ui/SelectorProductos";
import { FaTrash, FaPlus, FaTimes, FaMoneyBillWave } from "react-icons/fa";

export default function ModalMesa({ mesa, onClose, refetch }) {
  const { productos } = useProductos();
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [pedidoActual, setPedidoActual] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setHistorial(mesa.productos || []);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  const imprimirTicket = async (productos, mesa, orden, hora, fecha) => {
    const parrilla = productos.filter(
      (p) => p.categoria?.toLowerCase() === "brasas"
    );
    const cocina = productos.filter(
      (p) => p.categoria?.toLowerCase() !== "brasas"
    );

    const enviarAImpresora = async (items, ip) => {
      if (items.length === 0) return;
      try {
        const res = await fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mesa,
            productos: items,
            orden,
            hora,
            fecha,
            metodoPago,
            ip,
          }),
        });
        if (!res.ok) throw new Error();
      } catch (err) {
        console.error("Error al imprimir:", err);
        Swal.fire("Error", "No se pudo imprimir el ticket", "error");
      }
    };

    await enviarAImpresora(parrilla, "192.168.0.101"); // Impresora de parrilla
    await enviarAImpresora(cocina, "192.168.0.100"); // ✅ correcto
    // Impresora de cocina
  };

  const enviarPedido = async () => {
    if (!pedidoActual.length) {
      Swal.fire({
        icon: "warning",
        title: "Sin productos",
        text: "Agrega productos antes de enviar el pedido.",
      });
      return;
    }

    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const fecha = new Date().toLocaleDateString("es-AR");
    const orden = Date.now();
    const productosTotales = [...historial, ...pedidoActual];
    const total = productosTotales.reduce(
      (acc, p) =>
        acc + (p.precio * p.cantidad - (p.descuento || 0) * p.cantidad),
      0
    );

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          numero: mesa.numero,
          productos: productosTotales,
          metodoPago,
          total,
          estado: "ocupado",
          hora,
          fecha,
        }),
      });

      await Swal.fire({
        icon: "success",
        title: "Pedido enviado",
        text: "La mesa quedó ocupada correctamente.",
        timer: 2000,
      });

      await imprimirTicket(productosTotales, mesa.numero, orden, hora, fecha);
      setHistorial(productosTotales);
      setPedidoActual([]);
      refetch?.();
    } catch (err) {
      console.error("Error al guardar en la base de datos:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar el pedido.",
      });
    }
  };
  const eliminarComanda = async () => {
    const confirmar = confirm(
      "¿Seguro que querés liberar la mesa sin comanda?"
    );
    if (!confirmar) return;

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          numero: mesa.numero,
          productos: [],
          metodoPago: "",
          total: 0,
          estado: "libre",
          hora: "",
          fecha: "",
        }),
      });

      refetch?.();
      onClose();
    } catch (err) {
      console.error("Error al liberar mesa:", err);
      alert("No se pudo liberar la mesa.");
    }
  };

  const todosLosProductos = [...historial, ...pedidoActual];
  const subtotal = todosLosProductos.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );
  const descuento = todosLosProductos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const total = subtotal - descuento + iva;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-5xl rounded-2xl p-6 shadow-2xl text-white max-h-screen overflow-y-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-orange-400">
            🍽️ Mesa {mesa.numero}
          </h2>
          <button
            onClick={() => {
              refetch?.();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
          <button
            onClick={enviarPedido}
            className="bg-green-500 hover:bg-green-600 py-2 rounded-xl w-full"
          >
            <FaPlus className="inline mr-1" /> Enviar Pedido
          </button>

          <button
            onClick={() => setMostrarCobro(true)}
            className="bg-blue-500 hover:bg-blue-600 py-2 rounded-xl w-full"
          >
            💰 Cobrar Cuenta
          </button>

          <button
            onClick={eliminarComanda}
            className="bg-red-600 hover:bg-red-700 py-2 rounded-xl w-full"
          >
            <FaTrash className="inline mr-2" /> Liberar Mesa
          </button>
        </div>

        <button
          onClick={() => setMostrarSelector(true)}
          className="w-full bg-orange-600 hover:bg-orange-700 py-2 rounded-xl font-semibold"
        >
          ➕ Añadir producto
        </button>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs">
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2">Cant.</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Desc.</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {todosLosProductos.map((p, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-2">
                    {p.nombre}
                    {p.observacion && (
                      <div className="text-[11px] text-cyan-300 italic">
                        📝 {p.observacion}
                      </div>
                    )}
                    {p.adicionales?.length > 0 && (
                      <div className="text-[10px] text-gray-400">
                        + {p.adicionales.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="text-center">{p.cantidad}</td>
                  <td className="text-center">${p.precio}</td>
                  <td className="text-center">${p.descuento || 0}</td>
                  <td className="text-center font-semibold">
                    $
                    {(
                      p.precio * p.cantidad -
                      (p.descuento || 0) * p.cantidad
                    ).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        const nuevos = todosLosProductos.filter(
                          (_, index) => index !== i
                        );
                        const nuevosHistorial =
                          i < historial.length
                            ? nuevos.slice(0, historial.length - 1)
                            : historial;
                        const nuevosActual =
                          i >= historial.length
                            ? nuevos.slice(historial.length)
                            : pedidoActual;
                        setHistorial(nuevosHistorial);
                        setPedidoActual(nuevosActual);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right text-sm space-y-1">
          <p>
            Subtotal:{" "}
            <span className="text-white/80">${subtotal.toFixed(2)}</span>
          </p>
          <p>
            Descuento:{" "}
            <span className="text-white/80">-${descuento.toFixed(2)}</span>
          </p>

          <p className="text-cyan-400 font-bold text-lg mt-2">
            Total: ${subtotal.toFixed(2)}
          </p>
        </div>

        {mostrarPago && (
          <div className="mt-6">
            <label className="text-sm font-medium flex items-center gap-1">
              <FaMoneyBillWave /> Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-white/20 rounded-xl bg-white/10 text-white"
            >
              <option value="">Selecciona</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        )}

        {mostrarResumen && (
          <Resumen mesa={mesa} onClose={() => setMostrarResumen(false)} />
        )}
        {mostrarCobro && (
          <CobrarCuentaModal
            onClose={() => setMostrarCobro(false)}
            mesa={mesa}
            productos={todosLosProductos}
            total={total}
            refetch={refetch}
          />
        )}
        {mostrarSelector && (
          <SelectorProductos
            productos={productos}
            onSelect={(producto) => {
              const nuevo = {
                ...producto,
                descuento: producto.descuento || 0,
                adicionales: producto.adicionales || [],
                observacion: producto.observacion || "",
              };

              // Si ya existe ese producto con el MISMO nombre y la MISMA observación, sumá la cantidad
              const indexExistente = pedidoActual.findIndex(
                (p) =>
                  p.nombre === nuevo.nombre &&
                  (p.observacion || "") === (nuevo.observacion || "")
              );

              if (indexExistente !== -1) {
                setPedidoActual(
                  pedidoActual.map((p, i) =>
                    i === indexExistente
                      ? { ...p, cantidad: p.cantidad + nuevo.cantidad }
                      : p
                  )
                );
              } else {
                setPedidoActual([...pedidoActual, nuevo]);
              }
            }}
            onClose={() => setMostrarSelector(false)}
          />
        )}
      </div>
    </div>
  );
}
