"use client";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

export default function TestFirebaseButton() {
  const guardarTest = async () => {
    try {
      await set(ref(db, `tickets/TEST123`), {
        mesa: "TEST123",
        hora: new Date().toISOString(),
        productos: [{ nombre: "Prueba", precio: 100, cantidad: 1 }],
        total: 100,
        metodo: "Efectivo",
        estado: "pendiente",
      });
      alert("✅ Ticket de prueba guardado en Firebase");
    } catch (err) {
      console.error("Error al guardar en Firebase:", err);
      alert("❌ Error al guardar en Firebase");
    }
  };

  return (
    <button
      onClick={guardarTest}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-4"
    >
      Test Firebase
    </button>
  );
}
