import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const ochoHorasAtras = new Date(Date.now() - 8 * 60 * 60 * 1000);

    const result = await db.collection("pedidos").deleteMany({
      estado: "entregado",
      horaEntrega: { $lt: ochoHorasAtras.toISOString() },
    });

    return NextResponse.json({
      message: "Pedidos entregados eliminados si superaban las 8hs",
      eliminados: result.deletedCount,
    });
  } catch (error) {
    console.error("Error al limpiar pedidos:", error);
    return NextResponse.json(
      { error: "Error al limpiar pedidos" },
      { status: 500 }
    );
  }
}
