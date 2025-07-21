"use client";

import { useState } from "react";
import BackArrow from "@/app/components/ui/BackArrow";
import DeliveryForm from "./DeliveryForm";
import RestauranteForm from "./RestauranteForm";

export default function Pedidos() {
  const [modoPedido, setModoPedido] = useState("delivery");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 text-white px-4 py-12 flex items-center justify-center">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-8">
        <div className="mb-6">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          🍽 Nuevo Pedido
        </h2>

        {/* Botones de selección */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            className={`px-6 py-3 rounded-xl font-semibold ${
              modoPedido === "delivery" ? "bg-orange-500" : "bg-white/10"
            } transition`}
            onClick={() => setModoPedido("delivery")}
          >
            Delivery
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-semibold ${
              modoPedido === "restaurante" ? "bg-orange-500" : "bg-white/10"
            } transition`}
            onClick={() => setModoPedido("restaurante")}
          >
            Restaurante
          </button>
        </div>

        {/* Renderizamos el formulario correspondiente */}
        {modoPedido === "delivery" ? <DeliveryForm /> : <RestauranteForm />}
      </div>
    </div>
  );
}
