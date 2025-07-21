import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { total } = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("cajaRegistradora").updateOne(
      {},
      {
        $inc: { montoActual: total },
        $set: { fechaActualizacion: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error al sumar en caja:", err);
    return NextResponse.json(
      { error: "Error al sumar en caja" },
      { status: 500 }
    );
  }
}
