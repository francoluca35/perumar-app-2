import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const pedido = await req.json();

    if (!pedido || !pedido.nombre || !pedido.total) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos" },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "pedidos"), {
      ...pedido,
      estado: pedido.estado || "en curso",
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Pedido guardado correctamente",
    });
  } catch (error) {
    console.error("🔥 Error en POST /api/pedidos:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}
