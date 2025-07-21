// components/Resumen.js
"use client";
import React from "react";
import jsPDF from "jspdf";

export default function Resumen({ mesa, onClose }) {
  if (!mesa) return null;

  const total = mesa.productos.reduce((acc, prod) => {
    const base = prod.precio * prod.cantidad;
    const desc = (prod.descuento || 0) * prod.cantidad;
    return acc + (base - desc);
  }, 0);

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    let y = 10;

    doc.text("RESTAURANTE", 80, y);
    y += 8;
    doc.text(`Mesa: ${mesa.numero}`, 10, y);
    y += 6;
    doc.text(`Cliente: ${mesa.cliente}`, 10, y);
    y += 6;
    doc.text(`Hora: ${mesa.hora}`, 10, y);
    y += 6;
    doc.text(`Fecha: ${mesa.fecha}`, 10, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Resumen del pedido:", 10, y);
    doc.setFont("helvetica", "normal");
    y += 8;

    mesa.productos.forEach((p, i) => {
      const adicionales =
        p.adicionales?.length > 0 ? ` + ${p.adicionales.join(", ")}` : "";
      doc.text(`${p.cantidad} x ${p.nombre}${adicionales}`, 10, y);
      y += 6;
    });

    y += 6;
    doc.text(`Total a pagar: $${total.toFixed(2)}`, 10, y);
    y += 10;
    doc.text("¡Gracias por su compra!", 60, y);

    doc.save(`ticket_mesa${mesa.numero}.pdf`);
  };

  const enviarWhatsApp = () => {
    const resumen = mesa.productos
      .map(
        (p) =>
          `${p.cantidad} x ${p.nombre}${
            p.adicionales?.length ? ` + ${p.adicionales.join(", ")}` : ""
          }`
      )
      .join("\n");

    const mensaje = `🧾 Cuenta - Mesa ${mesa.numero}%0A👤 Cliente: ${
      mesa.cliente
    }%0A🕒 Hora: ${mesa.hora}%0A🍽 Pedido:%0A${encodeURIComponent(
      resumen
    )}%0A💰 Total: $${total.toFixed(2)}`;

    const numero = prompt(
      "📱 Ingrese el número de WhatsApp (con código de país, sin +):"
    );
    if (numero) {
      const link = `https://wa.me/${numero}?text=${mensaje}`;
      window.open(link, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-white text-black p-6 rounded-2xl max-w-xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-red-600 text-xl font-bold hover:scale-110 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          🧾 Cuenta de la Mesa
        </h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>🪑 Mesa:</strong> {mesa.numero}
          </p>
          <p>
            <strong>👤 Cliente:</strong> {mesa.cliente}
          </p>
          <p>
            <strong>🕒 Fecha:</strong> {mesa.fecha}
          </p>
          <p>
            <strong>🕒 Hora:</strong> {mesa.hora}
          </p>

          <div>
            <strong>🍽 Resumen del pedido:</strong>
            <ul className="list-disc pl-5 mt-1">
              {mesa.productos.map((prod, i) => (
                <li key={i}>
                  {prod.nombre} x {prod.cantidad}{" "}
                  {prod.adicionales?.length > 0 && (
                    <>+ {prod.adicionales.join(", ")}</>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-2">
            <strong>💰 Total a pagar:</strong> ${total.toFixed(2)}
          </p>

          <label className="block mt-4">
            <strong>💳 Forma de pago:</strong>
            <select className="w-full mt-1 px-3 py-2 border rounded">
              <option value="">Selecciona</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </label>

          <div className="flex justify-between mt-6 gap-2">
            <button
              className="w-1/2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
              onClick={generarPDF}
            >
              Generar Ticket PDF
            </button>
            <button
              className="w-1/2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
              onClick={enviarWhatsApp}
            >
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
