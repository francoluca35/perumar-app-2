import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Asegurate de tener este helper configurado

export async function POST(req) {
  try {
    const { mesa } = await req.json();

    if (!mesa) {
      return NextResponse.json(
        { error: "Número de mesa faltante" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("mesas")
      .updateOne({ numero: mesa }, { $set: { pagada: true } });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Mesa ${mesa} marcada como pagada`,
    });
  } catch (err) {
    console.error("Error al marcar mesa pagada:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
