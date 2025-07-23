// src/app/hooks/useGuardarDatosCliente.js
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function useGuardarDatosCliente() {
  const guardarDatosCliente = async ({
    productos,
    total,
    metodoPago = "pendiente",
    mesaNumero = null,
    tipoMesa = null,
  }) => {
    try {
      const comidas = productos
        .filter((p) => p.tipo === "comida")
        .map((p) => p.nombre);
      const bebidas = productos
        .filter((p) => p.tipo === "bebida")
        .map((p) => p.nombre);

      await addDoc(collection(db, "datos_clientes"), {
        timestamp: new Date(),
        comida: comidas.join(", ") || null,
        bebida: bebidas.join(", ") || null,
        total,
        metodoPago,
        mesa: mesaNumero,
        tipoMesa,
      });
    } catch (error) {
      console.error("Error al guardar datos del cliente:", error);
    }
  };

  return guardarDatosCliente;
}
