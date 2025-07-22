import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const { id, nuevoEstado } = await req.json();

    if (!id || !nuevoEstado) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const pedidoRef = doc(db, "pedidos", id);
    await updateDoc(pedidoRef, { estado: nuevoEstado });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en PUT /api/maps/estado:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}
