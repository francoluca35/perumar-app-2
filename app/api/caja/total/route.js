export const runtime = "nodejs";

import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const caja = db.collection("cajaRegistradora");

    const registros = await caja.find().toArray();
    const total = registros.reduce((acc, item) => acc + (item.monto || 0), 0);

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener total efectivo:", error);
    return new Response(JSON.stringify({ error: "Error al consultar caja" }), {
      status: 500,
    });
  }
}
