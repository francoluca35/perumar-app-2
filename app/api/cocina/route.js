import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");

    const nuevoPedido = {
      mesa: data.mesa,
      cliente: data.cliente,
      productos: data.productos,
      hora: new Date().toLocaleTimeString("es-AR"),
      estado: "pendiente",
    };

    await db.collection("cocina").insertOne(nuevoPedido);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al guardar en cocina" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const pedidos = await db
      .collection("cocina")
      .find()
      .sort({ hora: -1 }) // opcional
      .toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener cocina" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { mesa } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("cocina").deleteOne({ mesa });

    return NextResponse.json({ success: true, message: "Pedido eliminado" });
  } catch (error) {
    console.error("Error al eliminar pedido de cocina:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
