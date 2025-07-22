"use client";

import { useEffect, useState } from "react";
import TarjetaPedido from "./TarjetaPedido";
import UserDropdown from "@/app/components/ui/UserDropdown";
import { useAuth } from "@/context/AuthContext";

export default function RutaDelivery() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");

  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    const res = await fetch("/api/pedidos");
    const data = await res.json();

    // Filtramos solo los pedidos de tipo delivery
    const pedidosDelivery = data.filter((p) => p.modoPedido === "delivery");

    const ahora = new Date();
    const filtrados = pedidosDelivery.filter((p) => {
      if (p.estado === "entregado" && p.horaEntrega) {
        const entrega = new Date(p.horaEntrega);
        const diffHoras = (ahora - entrega) / (1000 * 60 * 60);
        return diffHoras <= 8;
      }
      return true;
    });

    const ordenados = filtrados.sort((a, b) => {
      const dateA = new Date(a.horaEntrega || a.fecha);
      const dateB = new Date(b.horaEntrega || b.fecha);
      return dateB - dateA;
    });

    setPedidos(ordenados);
  };

  const marcarEntregado = async (id) => {
    const horaEntrega = new Date().toISOString();
    await fetch(`/api/pedidos/entregar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, horaEntrega }),
    });
    fetchPedidos();
  };

  const pedidosEnCamino = pedidos.filter((p) => p.estado === "en camino");
  const pedidosEntregados = pedidos.filter((p) => p.estado === "entregado");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] via-[#111] to-black text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-semibold">
          Bienvenido {user?.nombreCompleto} - {fecha}
        </h2>
        <UserDropdown />
      </div>

      {/* EN CAMINO */}
      <section>
        <h4 className="text-xl font-semibold mb-4 text-cyan-400">En Camino</h4>

        {pedidosEnCamino.length === 0 ? (
          <div className="bg-red-900/80 text-white text-center p-4 rounded-xl shadow border border-red-500 font-semibold animate-pulse">
            🚫 No hay pedidos en curso actualmente.
          </div>
        ) : (
          pedidosEnCamino.map((pedido) => (
            <TarjetaPedido
              key={pedido._id}
              pedido={pedido}
              onEntregar={marcarEntregado}
            />
          ))
        )}
      </section>

      {/* ENTREGADOS */}
      {pedidosEntregados.length > 0 && (
        <section className="mt-10">
          <h4 className="text-xl font-semibold mb-4 text-green-400">
            Entregados
          </h4>
          {pedidosEntregados.map((pedido) => (
            <TarjetaPedido key={pedido._id} pedido={pedido} entregado />
          ))}
        </section>
      )}
    </div>
  );
}
