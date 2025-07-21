import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const { id } = params;
    const pedido = await db
      .collection("pedidos")
      .findOne({ _id: new ObjectId(id) });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
