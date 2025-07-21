"use client";

import { useState, useEffect, Suspense } from "react";
import PrivateRoute from "../models/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/ui/TablaMetrica";
import BotonesMenu from "../components/ui/BotonesMenu";
import UserDropdown from "../components/ui/UserDropdown";
import AbrirCaja from "../components/ui/AbrirCaja";
import { db } from "@/lib/firebase";
import { onValue, ref, remove } from "firebase/database";

export default function ScreenHome() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ticketsPendientes, setTicketsPendientes] = useState([]);

  useEffect(() => {
    if (user?.rol === "admin") {
      const mostrarAlIniciar = sessionStorage.getItem("mostrarCaja");

      if (mostrarAlIniciar === "true") {
        setMostrarModal(true);
        sessionStorage.removeItem("mostrarCaja");
      }

      const handleAbrirCaja = () => {
        setMostrarModal(true);
      };

      window.addEventListener("abrirCaja", handleAbrirCaja);

      const ticketsRef = ref(db, "tickets");
      const unsubscribe = onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const ticketsPend = [];

        Object.entries(data).forEach(([mesa, ticket]) => {
          if (ticket.estado === "pendiente") {
            const tiempo = new Date(ticket.hora);
            const ahora = new Date();
            const diferenciaMinutos = (ahora - tiempo) / 60000;

            ticketsPend.push({ ...ticket, mesa });

            if (diferenciaMinutos > 3) {
              alert(
                `⚠️ ¡Hace más de 3 minutos que la Mesa ${mesa} pagó! Imprimí el ticket.`
              );
            }
          }
        });

        setTicketsPendientes(ticketsPend);
      });

      return () => {
        window.removeEventListener("abrirCaja", handleAbrirCaja);
        unsubscribe();
      };
    }
  }, [user]);

  const imprimirTicket = async (ticket) => {
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const orden = Date.now();
    const { mesa, productos, metodo } = ticket;

    const subtotal = productos.reduce(
      (acc, p) => acc + p.precio * p.cantidad,
      0
    );
    const descuento = productos.reduce(
      (acc, p) => acc + (p.descuento || 0) * p.cantidad,
      0
    );
    const totalFinal = subtotal - descuento;

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
          <h1>Mesa: ${mesa}</h1>
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
          <div class="item total"><span>Total:</span><span>$${totalFinal.toFixed(
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

      ventana.onbeforeunload = async () => {
        try {
          await remove(ref(db, `tickets/${mesa}`));
          console.log("✅ Ticket eliminado de Firebase");
        } catch (error) {
          console.error("❌ Error al eliminar ticket:", error);
        }
      };
    }
  };

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-6 text-white flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">
            Bienvenido {user?.nombreCompleto} - {fecha}
          </h2>
          <UserDropdown onAbrirCaja={() => setMostrarModal(true)} />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 flex-grow">
          <Suspense
            fallback={<p className="text-gray-400">Cargando menú...</p>}
          >
            <BotonesMenu />
          </Suspense>

          {ticketsPendientes.length > 0 && (
            <div className="fixed right-4 top-24 z-50 flex flex-col gap-6">
              {ticketsPendientes.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.mesa}
                  className="bg-yellow-300 text-black p-4 rounded-xl shadow-xl w-72"
                >
                  <h2 className="text-lg font-bold">🧾 Ticket pendiente</h2>
                  <p>Mesa: {ticket.mesa}</p>
                  <p>Total: ${ticket.total.toFixed(2)}</p>
                  <p>Pago: {ticket.metodo || "–"}</p>
                  <button
                    onClick={() => imprimirTicket(ticket)}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-semibold"
                  >
                    🖨️ Imprimir ticket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <AbrirCaja
          visible={mostrarModal}
          onClose={() => setMostrarModal(false)}
        />
      </main>
    </PrivateRoute>
  );
}
