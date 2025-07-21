import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const pedido = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");
    const collection = db.collection("pedidos");

    const nuevoPedido = {
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: pedido.fecha || new Date().toISOString(),
    };

    const resultado = await collection.insertOne(nuevoPedido);

    if (pedido.formaDePago === "efectivo") {
      const timestamp = new Date();

      await db.collection("ingresosDiarios").insertOne({
        totalPedido: pedido.total,
        timestamp,
      });

      await db.collection("cajaRegistradora").updateOne(
        {},
        {
          $inc: { montoActual: pedido.total },
          $set: { fechaActualizacion: timestamp },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pedido guardado correctamente",
      id: resultado.insertedId,
    });
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const pedidos = await db.collection("pedidos").find().toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
