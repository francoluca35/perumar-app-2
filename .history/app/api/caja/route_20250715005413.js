import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

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
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
