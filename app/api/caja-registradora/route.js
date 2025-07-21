import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const caja = await db.collection("cajaRegistradora").findOne({});
    return NextResponse.json({
      montoActual: caja?.montoActual || 0,
      fechaActualizacion: caja?.fechaActualizacion || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const pedido = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");

    const collection = db.collection("pedidos");
    const resultado = await collection.insertOne({
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: pedido.fecha || new Date().toISOString(),
    });

    if (pedido.formaDePago === "efectivo") {
      const fechaLocal = new Date().toLocaleDateString("es-AR");

      // 🔹 SUMAR al informe diario
      await db
        .collection("ingresosDiarios")
        .updateOne(
          { fecha: fechaLocal },
          { $inc: { ingresoTotal: pedido.total } },
          { upsert: true }
        );

      // 🔹 SUMAR a la caja registradora
      await db.collection("cajaRegistradora").updateOne(
        {},
        {
          $inc: { montoActual: pedido.total },
          $set: { fechaActualizacion: new Date() },
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

export async function PATCH(req) {
  try {
    const { monto } = await req.json();
    if (monto == null) {
      return NextResponse.json({ error: "Falta el monto" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("cajaRegistradora").updateOne(
      {},
      {
        $inc: { montoActual: parseFloat(monto) },
        $set: { fechaActualizacion: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Monto sumado correctamente" });
  } catch (err) {
    console.error("Error al sumar monto:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
