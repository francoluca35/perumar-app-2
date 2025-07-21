import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const generarCodigoOrden = () => {
  return Math.floor(1000 + Math.random() * 9000); // ej: 4573
};

export async function POST(req) {
  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");

    const { numeroMesa, cliente, productos, metodoPago, total } = data;

    // actualizar mesa
    await db.collection("tables").updateOne(
      { "mesaAdentro.numero": numeroMesa },
      {
        $set: {
          "mesaAdentro.$.estado": "ocupado",
          "mesaAdentro.$.productos": productos,
          "mesaAdentro.$.metodoPago": metodoPago,
          "mesaAdentro.$.total": total,
          "mesaAdentro.$.hora": new Date().toISOString(),
          "mesaAdentro.$.fecha": new Date().toLocaleDateString("es-AR"),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al enviar pedido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
