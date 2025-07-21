"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Swal from "sweetalert2";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

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

  // Cuando paso a QR/Link, inicializo totalMP con el totalFinal + comisión (si hay)
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

  const generarPagoMP = async () => {
    const res = await fetch("/api/mercado-pago/crear-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: totalMP, // <---- Usamos totalMP que incluye comisión
        mesa: mesa.numero,
        nombreCliente: nombreCliente || "Cliente",
      }),
    });
    const data = await res.json();
    setUrlPago(data.init_point);
    setExternalReference(data.external_reference);
  };

  useEffect(() => {
    if (paso === "qr" || paso === "link") generarPagoMP();
    // eslint-disable-next-line
  }, [paso, totalMP]);

  // ...El resto igual...

  useEffect(() => {
    let interval;
    let timeout;

    if ((paso === "qr" || paso === "link") && externalReference) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/mercado-pago/estado/${externalReference}`
          );
          const data = await res.json();

          if (data.status === "approved") {
            clearInterval(interval);
            clearTimeout(timeout);

            Swal.fire({
              icon: "success",
              title: "Pago aprobado",
              text: "El pago fue confirmado.",
              timer: 2000,
              showConfirmButton: false,
            }).then(async () => {
              setMetodo("Mercado Pago");

              try {
                await set(ref(db, `tickets/${mesa.numero}`), {
                  mesa: mesa.numero,
                  hora: new Date().toISOString(),
                  productos,
                  total: totalMP,
                  metodo: "Mercado Pago",
                  estado: "pendiente",
                  comision: comisionMP || 0,
                });
                console.log("✅ Ticket guardado en Firebase");
              } catch (err) {
                console.error("❌ Error al guardar en Firebase:", err);
                Swal.fire(
                  "Error",
                  "No se pudo guardar el ticket en Firebase",
                  "error"
                );
              }

              await fetch("/api/mesa/pago-confirmado", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mesa: mesa.numero }),
              });

              setPaso("confirmarImpresion");
            });
          }
        } catch (err) {
          console.error("Error al consultar estado del pago:", err);
        }
      }, 5000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        Swal.fire({
          icon: "success",
          title: "Pago aprobado",
          text: "El pago fue confirmado.",
          timer: 2000,
          showConfirmButton: false,
        }).then(async () => {
          setMetodo("Mercado Pago");

          await set(ref(db, `tickets/${mesa.numero}`), {
            mesa: mesa.numero,
            hora: new Date().toISOString(),
            productos,
            total: totalMP,
            metodo: "Mercado Pago",
            estado: "pendiente",
            comision: comisionMP || 0,
          });

          await fetch("/api/mesa/pago-confirmado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mesa: mesa.numero }),
          });

          setPaso("confirmarImpresion");
        });
      }, 2 * 60 * 1000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paso, externalReference, totalMP, comisionMP, mesa.numero, productos]);

  // ... El resto igual...

  const confirmarPago = async () => {
    imprimirTicket();

    await fetch("/api/print-ticket-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa: mesa.numero,
        total: totalMP, // Incluye la comisión
        metodoPago: metodo,
        comision: comisionMP || 0,
      }),
    });

    await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa.codigo,
        productos: [],
        metodoPago: metodo,
        total: totalMP,
        estado: "libre",
        hora: "",
        fecha: "",
      }),
    });

    await set(ref(db, `tickets/${mesa.numero}`), {
      mesa: mesa.numero,
      hora: new Date().toISOString(),
      productos,
      total: totalMP,
      metodo: metodo,
      estado: "pendiente",
      comision: comisionMP || 0,
    });

    refetch?.();
    onClose();
  };

  const imprimirTicket = async () => {
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const orden = Date.now();

    const html = `
      <html>
        <head>
          <style>
            @page { size: 58mm auto; margin: 0; }
            @media print {
              html, body {
                width: 54mm;
                margin: 0;
                padding: 0;
                transform: scale(0.90);
                transform-origin: top left;
              }
            }
            body {
              font-family: monospace;
              font-size: 12px;
              width: 52mm;
              margin: 0;
              text-align: center;
            }
            h2 { margin: 5px 0; font-size: 14px; }
            .logo { width: 100px; margin-bottom: 5px; }
            hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; font-weight: bold; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <img src="${
            window.location.origin
          }/Assets/logo-tick.png" class="logo" />
          <h2>🍽️ Perú Mar</h2>
          <h1>Mesa: ${mesa.numero}</h1>
          <h1>Orden #: ${orden}</h1>
          <h1>Hora: ${hora}</h1>
          <h1>Fecha: ${fecha}</h1>
          <hr />
          ${productos
            .map(
              (p) => `<div class="item">
                        <span>${p.cantidad}x ${p.nombre}</span>
                        <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
                      </div>`
            )
            .join("")}
          <hr />
          <div class="item"><span>Subtotal:</span><span>$${subtotal.toFixed(
            2
          )}</span></div>
          <div class="item"><span>Descuento:</span><span>-$${descuento.toFixed(
            2
          )}</span></div>
          ${
            (paso === "qr" || paso === "link") && comisionMP
              ? `<div class="item"><span>Comisión MP:</span><span>$${Number(
                  comisionMP
                ).toFixed(2)}</span></div>`
              : ""
          }
          <div class="item total"><span>Total:</span><span>$${totalMP.toFixed(
            2
          )}</span></div>
          <div class="item"><span>Pago:</span><span>${metodo}</span></div>
          <hr />
          <div class="footer">
            <h1>Tel: 1140660136</h1>
            <h1>Dirección: Rivera 2495 V. Celina</h1>
            <h1>Gracias por su visita!</h1>
          </div>
        </body>
      </html>
    `;

    const ventana = window.open("", "", "width=400,height=600");
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  };

  // ----------- PASO QR/LINK (CON COMISION) --------------
  if (paso === "qr" || paso === "link") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            {paso === "qr" ? "Pagar con QR" : "Link de pago"}
          </h2>
          <div className="mb-2">
            <label className="block text-gray-700 font-bold text-center mb-2">
              Agregar comisión Mercado Pago
            </label>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-700 text-sm">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={comisionMP === 0 ? "" : comisionMP}
                onChange={(e) => {
                  // Borra ceros a la izquierda y fuerza float (sin NaN)
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
                  setTotalMP(
                    Math.round(
                      (Number(totalFinal) +
                        (isNaN(floatValue) ? 0 : floatValue)) *
                        100
                    ) / 100
                  );
                }}
                className="w-24 border px-2 py-1 rounded text-center"
                placeholder="0.00"
              />

              <span className="text-gray-700 text-xs">(opcional)</span>
            </div>
            <div className="text-center mt-1">
              <span className="text-gray-800 font-bold">
                Total a cobrar: ${totalMP.toFixed(2)}
              </span>
            </div>
          </div>
          {urlPago ? (
            <>
              {paso === "qr" && (
                <div className="flex justify-center">
                  <QRCode value={urlPago} size={200} />
                </div>
              )}
              <a
                href={urlPago}
                target="_blank"
                className="block w-full py-3 text-center bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
              >
                Ir al pago
              </a>
            </>
          ) : (
            <p className="text-center text-gray-600 animate-pulse">
              Generando {paso === "qr" ? "QR" : "link"}...
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // --------- LOS DEMÁS PASOS IGUAL -----------

  if (paso === "efectivo") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Cobro en efectivo
          </h2>
          <p className="text-center text-lg text-black">
            Total: <b className="text-green-600">${totalFinal.toFixed(2)}</b>
          </p>
          <input
            type="number"
            placeholder="¿Con cuánto paga?"
            className="w-full p-3 rounded border text-lg"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
          />
          <p className="text-center text-black font-bold">
            Vuelto: <span className="text-green-600">${vuelto}</span>
          </p>
          <button
            onClick={async () => {
              // 1. Guardar el pedido como ingreso
              await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mesa: mesa.numero,
                  productos,
                  total: totalFinal,
                  nombreCliente: nombreCliente || "Cliente",
                  formaDePago: "efectivo",
                  fecha: new Date().toISOString(),
                }),
              });

              // ✅ Registrar ingreso diario
              await fetch("/api/informe-diario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  totalPedido: totalFinal,
                  timestamp: new Date().toISOString(),
                }),
              });

              // 2. Registrar ticket en Firebase
              await set(ref(db, `tickets/${mesa.numero}`), {
                mesa: mesa.numero,
                hora: new Date().toISOString(),
                productos,
                total: totalFinal,
                metodo: "Efectivo",
                estado: "pendiente",
              });

              // 3. Sumar efectivo a caja
              await fetch("/api/caja/sumar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ total: totalFinal }),
              });

              // 4. Feedback visual
              Swal.fire({
                icon: "success",
                title: "Ticket enviado a caja",
                text: "El administrador lo imprimirá.",
                timer: 2000,
                showConfirmButton: false,
              });

              // 5. Liberar la mesa
              await fetch("/api/mesas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  codigo: mesa.codigo,
                  productos: [],
                  metodoPago: "Efectivo",
                  total,
                  estado: "libre",
                  hora: "",
                  fecha: "",
                }),
              });

              refetch?.();
              onClose();
            }}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
          >
            Confirmar y enviar a caja
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "confirmarImpresion") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            El cliente ya pagó
          </h2>
          <p className="text-center text-black text-lg">
            Se envió aviso al administrador para imprimir el ticket.
          </p>
          <button
            onClick={async () => {
              await fetch("/api/mesas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  codigo: mesa.codigo,
                  productos: [],
                  metodoPago: metodo,
                  total: totalMP,
                  estado: "libre",
                  hora: "",
                  fecha: "",
                }),
              });

              onClose();
              refetch?.();
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
        <h2 className="text-center text-xl font-bold text-gray-800">
          Seleccionar método de pago
        </h2>
        <button
          onClick={() => setPaso("efectivo")}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
        >
          Efectivo
        </button>
        <button
          onClick={() => setPaso("qr")}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
        >
          Mercado Pago (QR)
        </button>
        <button
          onClick={() => setPaso("link")}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold"
        >
          Link de pago
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
