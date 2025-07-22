"use client";

import { useState } from "react";
import useMaps from "@/app/hooks/useMaps";
import BackArrow from "@/app/components/ui/BackArrow";
import useProductos from "@/app/hooks/useProductos";

export default function Maps() {
  const { pedidos, loading, refetch } = useMaps();
  const { productos } = useProductos();

  const [detalle, setDetalle] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const imprimirTicketPOS = (pedido) => {
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const orden = Date.now();
    const encabezado = pedido.tipo === "delivery" ? "DELIVERY" : "PARA LLEVAR";

    let subtotal = 0;

    const productosHTML = pedido.comidas
      .map((item) => {
        let nombre = item.comida || item.bebida || "";
        let precio = 0;

        if (item.comida) {
          const p = productos.find((prod) => prod.nombre === item.comida);
          precio = p?.precio || 0;
          subtotal += precio;

          if (item.adicionales?.length > 0) {
            const adicTotal = item.adicionales.length * 200;
            subtotal += adicTotal;
            return `
              <div class="item"><span>1x ${
                item.comida
              }</span><span>$${precio.toFixed(2)}</span></div>
              <div style="text-align:left;">+ ${item.adicionales.join(
                ", "
              )} ($${adicTotal.toFixed(2)})</div>
            `;
          }
        }

        if (item.bebida) {
          const p = productos.find((prod) => prod.nombre === item.bebida);
          precio = p?.precio || 0;
          subtotal += precio;
        }

        return `<div class="item"><span>1x ${nombre}</span><span>$${precio.toFixed(
          2
        )}</span></div>`;
      })
      .join("");

    const totalFinal = pedido.total.toFixed(2);
    const descuento = 0;
    const pago = pedido.formaDePago;
    const montoPagado = totalFinal;
    const vuelto = 0;

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
            .logo { width: 100px; margin-bottom: 5px; filter: grayscale(100%) contrast(200%); }
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
          <h1>${encabezado}</h1>
          <h1>Orden #: ${orden}</h1>
          <h1>Hora: ${hora}</h1>
          <h1>Fecha: ${fecha}</h1>
          <hr />
          ${productosHTML}
          <hr />
          <div class="item"><span>Subtotal:</span><span>$${subtotal.toFixed(
            2
          )}</span></div>
          <div class="item"><span>Descuento:</span><span>-$${descuento.toFixed(
            2
          )}</span></div>
          <div class="item total"><span>Total:</span><span>$${totalFinal}</span></div>
          <div class="item"><span>Pago:</span><span>${pago}</span></div>
          <div class="item"><span>Pagó:</span><span>$${montoPagado}</span></div>
          <div class="item"><span>Vuelto:</span><span>$${vuelto.toFixed(
            2
          )}</span></div>
          <hr />
          <div class="footer">
            <h1>Tel: 1140660136</h1>
            <h1>Dirección: Rivera 2495 V. Celina</h1>
            <h1>Gracias por su visita!</h1>
          </div>
          <script>window.onload = function() { window.print(); setTimeout(()=>window.close(), 500); }</script>
        </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=400,height=600");
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  };

  const handleEnviar = async (pedido) => {
    setEnviandoId(pedido._id);

    imprimirTicketPOS(pedido);

    try {
      const nuevoEstado =
        pedido.tipo === "delivery" ? "en camino" : "entregado";

      await fetch("/api/maps/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pedido._id, nuevoEstado }),
      });

      if (pedido.tipo === "entregalocal") {
        await fetch("/api/caja-registradora", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monto: pedido.total }),
        });
      }
      await fetch("/api/informe-diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPedido: pedido.total,
          timestamp: new Date(),
        }),
      });

      imprimirTicketPOS(pedido);
      await refetch();
    } catch (err) {
      console.error("Error al enviar:", err);
    } finally {
      setEnviandoId(null);
    }
  };

  if (loading)
    return <p className="text-white text-center">Cargando pedidos...</p>;

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtro === "todos") return true;
    return pedido.tipo === filtro;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 text-white px-6 py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-6">
        <BackArrow label="Volver al panel" />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 rounded-xl ${
            filtro === "todos" ? "bg-cyan-600" : "bg-white/10"
          } text-white`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("delivery")}
          className={`px-4 py-2 rounded-xl ${
            filtro === "delivery" ? "bg-cyan-600" : "bg-white/10"
          } text-white`}
        >
          Delivery
        </button>
        <button
          onClick={() => setFiltro("entregalocal")}
          className={`px-4 py-2 rounded-xl ${
            filtro === "entregalocal" ? "bg-cyan-600" : "bg-white/10"
          } text-white`}
        >
          Para llevar
        </button>
      </div>

      <div className="w-full max-w-4xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-6">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          📍 Pedidos
        </h2>

        <ul className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <li
              key={pedido._id}
              className="bg-white/10 border border-white/10 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-lg font-bold">{pedido.nombre}</p>
                {pedido.direccion && (
                  <p className="text-sm text-gray-300">{pedido.direccion}</p>
                )}
                <p className="text-xs text-gray-400 mb-1">
                  Fecha: {pedido.fecha}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Total: ${pedido.total}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                    pedido.estado === "entregado"
                      ? "bg-green-600"
                      : pedido.estado === "en camino"
                      ? "bg-cyan-500"
                      : "bg-yellow-400"
                  }`}
                >
                  {pedido.estado.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handleEnviar(pedido)}
                  disabled={
                    pedido.estado !== "en curso" || enviandoId === pedido._id
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    pedido.estado === "en curso"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  {pedido.tipo === "delivery" ? "Enviar" : "Entregar"}
                </button>

                <button
                  onClick={() => setDetalle(pedido)}
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Ver info
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {detalle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black p-6 rounded-2xl max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setDetalle(null)}
              className="absolute top-2 right-3 text-red-500 text-xl font-bold hover:scale-110"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4">🧾 Detalle del pedido</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>👤 Nombre:</strong> {detalle.nombre}
              </p>
              {detalle.tipo === "delivery" && (
                <p>
                  <strong>📍 Dirección:</strong> {detalle.direccion}
                </p>
              )}
              <p>
                <strong>🗓 Fecha:</strong> {detalle.fecha}
              </p>
              <p>
                <strong>💳 Pago:</strong> {detalle.formaDePago}
              </p>
              <p>
                <strong>💰 Total:</strong> ${detalle.total}
              </p>
              <p>
                <strong>📝 Observación:</strong>{" "}
                {detalle.observacion || "Ninguna"}
              </p>

              <div>
                <strong>🍽 Pedido:</strong>
                <ul className="list-disc list-inside mt-1">
                  {detalle.comidas.map((item, i) => (
                    <li key={i}>
                      {item.comida || item.bebida}
                      {item.adicionales?.length > 0 && (
                        <> + {item.adicionales.join(", ")}</>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {detalle.tipo === "delivery" && (
                <div className="mt-3">
                  <a
                    href={detalle.mapsLink}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    📍 Ver en Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
