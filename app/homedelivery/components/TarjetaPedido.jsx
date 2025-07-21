"use client";

import Boton from "./Boton";
import { FiMapPin, FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function TarjetaPedido({ pedido, entregado = false }) {
  const router = useRouter();

  return (
    <div
      className={`${
        entregado
          ? "bg-green-700/20 border border-green-600"
          : "bg-blue-900/20 border border-blue-700"
      } rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md`}
    >
      <p className="font-bold text-lg">Pedido ({pedido.nombre})</p>
      <p className="text-sm text-gray-300">Nmro de Orden: {pedido._id}</p>

      <div className="text-sm text-gray-200">
        {pedido.comidas?.map((item, idx) => (
          <div key={idx} className="mb-1">
            {item.comida && <strong> 🍽 {item.comida}</strong>}
            {item.bebida && (
              <>
                {item.comida && " + "}
                🥤 <strong>{item.bebida}</strong>
              </>
            )}
            {item.adicionales?.length > 0 && (
              <span> + {item.adicionales.join(", ")}</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-300 mb-3">
        Dirección: {pedido.direccion}
      </p>
      <p className="text-sm text-gray-300 mb-3 font-bold">
        Total: ${pedido.total}
      </p>

      {pedido.horaEntrega && (
        <p className="text-sm text-gray-300 mb-3 -mt-2">
          Hora de entrega: {new Date(pedido.horaEntrega).toLocaleString()}
        </p>
      )}

      <div className="flex gap-4 mt-4">
        {entregado ? (
          <Boton disabled color="gray">
            <FiCheck /> Entregado
          </Boton>
        ) : (
          <Boton
            color="gray"
            onClick={() => router.push(`/vermapa?id=${pedido._id}`)}
          >
            <FiMapPin /> Ver Mapa
          </Boton>
        )}
      </div>
    </div>
  );
}
