// app/components/TicketPreview.jsx
"use client";
import { useEffect, useRef } from "react";

export default function TicketPreview({
  mesa,
  productos,
  total,
  onClose,
  onImprimir,
  onEnviar,
}) {
  const printRef = useRef(null);

  useEffect(() => {
    if (printRef.current) {
      printRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-[999] flex justify-center items-center px-4">
      <div
        className="bg-white text-black rounded-xl p-6 max-w-md w-full space-y-4 overflow-y-auto max-h-[90vh]"
        ref={printRef}
      >
        <h2 className="text-center font-bold text-lg mb-2">
          🧾 Vista previa del Ticket
        </h2>
        <div className="border p-3 rounded text-sm">
          <p>
            <strong>Mesa:</strong> {mesa.numero}
          </p>
          <p>
            <strong>Fecha:</strong> {new Date().toLocaleDateString("es-AR")}
          </p>
          <p>
            <strong>Hora:</strong>{" "}
            {new Date().toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <hr className="my-2" />
          {productos.map((p, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {p.cantidad} x {p.nombre}
              </span>
              <span>
                $
                {(
                  p.precio * p.cantidad -
                  (p.descuento || 0) * p.cantidad
                ).toFixed(2)}
              </span>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onEnviar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Enviar sin imprimir
          </button>
          <button
            onClick={onImprimir}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Imprimir
          </button>
          <button onClick={onClose} className="text-gray-500 underline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
