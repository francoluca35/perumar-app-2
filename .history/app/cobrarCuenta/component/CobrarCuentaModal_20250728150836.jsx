"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Swal from "sweetalert2";
import { ref as dbRef, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export default function CobrarCuentaModal({
  onClose,
  mesa,
  productos,
  total,
  nombreCliente,
  refetch,
}) {
  const [paso, setPaso] = useState("seleccion");
  const [metodo, setMetodo] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [vuelto, setVuelto] = useState(0);
  const [urlPago, setUrlPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [comisionMP, setComisionMP] = useState(0);
  const [totalMP, setTotalMP] = useState(0);

  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = productos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const totalFinal = subtotal - descuento;

  useEffect(() => {
    if (paso === "qr" || paso === "link") {
      setTotalMP(
        Math.round((Number(totalFinal) + Number(comisionMP)) * 100) / 100
      );
    }
  }, [paso, totalFinal, comisionMP]);

  useEffect(() => {
    const pago = parseFloat(montoPagado);
    setVuelto(!isNaN(pago) ? (pago - totalFinal).toFixed(2) : 0);
  }, [montoPagado, totalFinal]);

  const limpiarMesa = async () => {
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
          tipoMesa: mesa.tipoMesa,
        }),
      });

      console.log("✅ Mesa liberada correctamente");
    } catch (error) {
      console.error("❌ Error al liberar la mesa:", error);
    }
  };

  const guardarTicket = async (monto, metodoPago) => {
    await set(dbRef(realtimeDb, `tickets/${mesa.numero}`), {
      mesa: mesa.numero,
      hora: new Date().toISOString(),
      productos,
      total: monto,
      metodo: metodoPago,
      estado: "pendiente",
      comision: metodoPago === "Mercado Pago" ? comisionMP || 0 : 0,
    });
  };

  const procesarPagoEfectivo = async () => {
    const fechaActual = new Date().toISOString();

    // 1. Guardar el pedido
    await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa: mesa.numero,
        productos,
        total: totalFinal,
        nombreCliente: nombreCliente || "Cliente",
        formaDePago: "efectivo",
        fecha: fechaActual,
      }),
    });

    // 2. Guardar en informe diario
    await fetch("/api/informe-diario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalPedido: totalFinal, timestamp: fechaActual }),
    });

    // 3. Enviar a Firebase para imprimir
    await guardarTicket(totalFinal, "Efectivo");

    // 4. Sumar a caja
    await fetch("/api/caja/sumar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total: totalFinal }),
    });

    // 5. Liberar la mesa (solo una vez)
    await limpiarMesa();

    // 6. Confirmación visual
    Swal.fire({
      icon: "success",
      title: "Pago en efectivo registrado",
      timer: 2000,
      showConfirmButton: false,
    });

    // 7. Refrescar estado
    refetch?.();
    onClose();
  };

  const generarPagoMP = async () => {
    const res = await fetch("/api/mercado-pago/crear-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: totalMP,
        mesa: mesa.numero,
        nombreCliente: nombreCliente || "Cliente",
      }),
    });
    const data = await res.json();
    setUrlPago(data.init_point);
    setExternalReference(data.external_reference);
  };

  useEffect(() => {
    if ((paso === "qr" || paso === "link") && externalReference) {
      const interval = setInterval(async () => {
        const res = await fetch(
          `/api/mercado-pago/estado/${externalReference}`
        );
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(interval);
          Swal.fire({
            icon: "success",
            title: "Pago aprobado",
            timer: 2000,
            showConfirmButton: false,
          });
          setMetodo("Mercado Pago");

          await guardarTicket(totalMP, "Mercado Pago");
          await fetch("/api/mesa/pago-confirmado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mesa: mesa.numero }),
          });
          setPaso("confirmarImpresion");
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [paso, externalReference]);

  if (paso === "seleccion") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Seleccionar método de pago
          </h2>
          <button
            onClick={() => setPaso("efectivo")}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold"
          >
            Efectivo
          </button>
          <button
            onClick={() => setPaso("qr")}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold"
          >
            QR Mercado Pago
          </button>
          <button
            onClick={() => setPaso("link")}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold"
          >
            Link Mercado Pago
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-300 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "efectivo") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white  p-6 rounded-xl max-w-md w-full space-y-4">
          <h2 className="text-xl text-black font-bold text-center">
            Cobro en efectivo
          </h2>
          <p className="text-center text-black text-lg">
            Total: ${totalFinal.toFixed(2)}
          </p>
          <input
            type="number"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
            className="w-full bg-black/20 p-3 border rounded text-lg"
            placeholder="¿Con cuánto paga?"
          />
          <p className="text-black text-center">Vuelto: ${vuelto}</p>
          <button
            onClick={procesarPagoEfectivo}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold"
          >
            Confirmar
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-300 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "qr" || paso === "link") {
    if (!urlPago) generarPagoMP();

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
          <h2 className="text-xl font-bold text-center">
            {paso === "qr" ? "Pagar con QR" : "Link de Pago"}
          </h2>
          <input
            type="number"
            placeholder="Comisión Mercado Pago (opcional)"
            value={comisionMP || ""}
            onChange={(e) => setComisionMP(parseFloat(e.target.value) || 0)}
            className="w-full border px-3 py-2 rounded"
          />
          <p className="text-center">
            Total con comisión: ${totalMP.toFixed(2)}
          </p>
          {paso === "qr" && urlPago && <QRCode value={urlPago} size={200} />}
          {urlPago && (
            <a
              href={urlPago}
              target="_blank"
              className="block text-center bg-blue-600 text-white py-3 rounded-xl font-bold"
            >
              Ir al pago
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-300 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "confirmarImpresion") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
          <h2 className="text-xl font-bold text-center">Pago confirmado</h2>
          <p className="text-center">
            Aviso enviado al administrador para imprimir.
          </p>
          <button
            onClick={async () => {
              await limpiarMesa();
              refetch?.();
              onClose();
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return null;
}
