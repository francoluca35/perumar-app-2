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
    setTotalMP(Math.round((totalFinal + comisionMP) * 100) / 100);
  }, [comisionMP, totalFinal]);

  useEffect(() => {
    const pago = parseFloat(montoPagado);
    setVuelto(!isNaN(pago) ? (pago - totalFinal).toFixed(2) : 0);
  }, [montoPagado, totalFinal]);

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
    if ((paso === "qr" || paso === "link") && totalMP > 0) {
      generarPagoMP();
    }
  }, [paso]);

  useEffect(() => {
    if (!externalReference) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/mercado-pago/estado/${externalReference}`);
      const data = await res.json();
      if (data.status === "approved") {
        clearInterval(interval);
        setMetodo("Mercado Pago");
        procesarPago(totalMP, "Mercado Pago");
      }
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      Swal.fire({
        icon: "info",
        title: "Pago no confirmado",
        text: "No se recibió confirmación de Mercado Pago.",
      });
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [externalReference]);

  const procesarPago = async (monto, metodoPago) => {
    // 1. Guardar el pedido
    await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa: mesa.numero,
        productos,
        total: monto,
        nombreCliente: nombreCliente || "Cliente",
        formaDePago: metodoPago,
        fecha: new Date().toISOString(),
      }),
    });

    // 2. Registrar ingreso diario
    await fetch("/api/informe-diario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalPedido: monto,
        timestamp: new Date().toISOString(),
      }),
    });

    // 3. Registrar en Firebase
    await set(dbRef(realtimeDb, `tickets/${mesa.numero}`), {
      mesa: mesa.numero,
      hora: new Date().toISOString(),
      productos,
      total: monto,
      metodo: metodoPago,
      estado: "pendiente",
      ...(metodoPago === "Mercado Pago" && comisionMP
        ? { comision: comisionMP }
        : {}),
    });

    // 4. Sumar a caja si es efectivo
    if (metodoPago === "Efectivo") {
      await fetch("/api/caja/sumar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: monto }),
      });
    }

    // 5. Imprimir ticket
    await fetch("/api/print-ticket-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa: mesa.numero,
        total: monto,
        metodoPago,
        comision: metodoPago === "Mercado Pago" ? comisionMP : 0,
      }),
    });

    // 6. Liberar la mesa
    await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa.codigo,
        productos: [],
        metodoPago,
        total: monto,
        estado: "libre",
        hora: "",
        fecha: "",
      }),
    });

    // 7. Feedback
    Swal.fire({
      icon: "success",
      title: "Ticket procesado",
      timer: 2000,
      showConfirmButton: false,
    });

    refetch?.();
    onClose();
  };

  if (paso === "efectivo") {
    return (
      <div className="modal">
        <div className="modal-box">
          <h2 className="text-xl font-bold text-center">Cobro en efectivo</h2>
          <p className="text-center text-lg">
            Total: <b>${totalFinal.toFixed(2)}</b>
          </p>
          <input
            type="number"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
            placeholder="¿Con cuánto paga?"
            className="input input-bordered w-full mt-3"
          />
          <p className="text-center font-bold">Vuelto: ${vuelto}</p>
          <button
            onClick={() => {
              setMetodo("Efectivo");
              procesarPago(totalFinal, "Efectivo");
            }}
            className="btn btn-success w-full mt-3"
          >
            Confirmar
          </button>
          <button onClick={onClose} className="btn w-full mt-2">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "qr" || paso === "link") {
    return (
      <div className="modal">
        <div className="modal-box space-y-4">
          <h2 className="text-xl font-bold text-center">
            {paso === "qr" ? "Pagar con QR" : "Link de pago"}
          </h2>

          <label className="text-sm font-medium">
            Comisión adicional Mercado Pago (opcional):
          </label>
          <input
            type="number"
            value={comisionMP}
            onChange={(e) => setComisionMP(parseFloat(e.target.value) || 0)}
            className="input input-bordered w-full"
            placeholder="Ej: 50"
          />

          <p className="text-center font-bold">
            Total a cobrar: ${totalMP.toFixed(2)}
          </p>

          {urlPago && (
            <>
              {paso === "qr" && (
                <div className="flex justify-center">
                  <QRCode value={urlPago} size={200} />
                </div>
              )}
              <a
                href={urlPago}
                target="_blank"
                className="btn btn-primary w-full"
              >
                Ir al pago
              </a>
            </>
          )}

          <button onClick={onClose} className="btn w-full">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="modal-box space-y-4">
        <h2 className="text-xl font-bold text-center">Método de pago</h2>
        <button
          onClick={() => setPaso("efectivo")}
          className="btn btn-success w-full"
        >
          Efectivo
        </button>
        <button onClick={() => setPaso("qr")} className="btn btn-info w-full">
          Mercado Pago (QR)
        </button>
        <button
          onClick={() => setPaso("link")}
          className="btn btn-secondary w-full"
        >
          Link de pago
        </button>
        <button onClick={onClose} className="btn w-full">
          Cancelar
        </button>
      </div>
    </div>
  );
}
