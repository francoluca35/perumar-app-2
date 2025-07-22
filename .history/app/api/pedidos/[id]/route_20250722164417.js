import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Falta el ID" }, { status: 400 });
    }

    const pedidoRef = doc(db, "pedidos", id);
    const pedidoSnap = await getDoc(pedidoRef);

    if (!pedidoSnap.exists()) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedidoSnap.data());
  } catch (error) {
    console.error("Error al obtener el pedido:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
