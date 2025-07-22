import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const pedido = await req.json();

    const payload = {
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: pedido.fecha || new Date().toLocaleString("es-AR"),
      timestamp: Timestamp.now(),
    };

    const pedidosRef = collection(db, "pedidos");
    const docRef = await addDoc(pedidosRef, payload);

    // Registrar ingreso si es efectivo
    if (pedido.formaDePago === "efectivo") {
      await addDoc(collection(db, "ingresosDiarios"), {
        totalPedido: pedido.total,
        timestamp: Timestamp.now(),
      });

      await addDoc(collection(db, "cajaRegistradora"), {
        tipo: "ingreso",
        monto: pedido.total,
        fecha: Timestamp.now(),
        motivo: "Pedido Delivery Efectivo",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pedido guardado en Firebase",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error al guardar pedido en Firebase:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido en Firebase" },
      { status: 500 }
    );
  }
}
