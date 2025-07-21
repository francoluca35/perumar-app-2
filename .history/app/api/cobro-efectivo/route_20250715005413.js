import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { totalPedido, pagoCliente } = await req.json();

    if (totalPedido == null || pagoCliente == null) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const vuelto = pagoCliente - totalPedido;
    const montoAIngresar = totalPedido; // el neto de la venta que ingresa a la caja

    const client = await clientPromise;
    const db = client.db("comandas");

    const caja = await db.collection("cajaRegistradora").findOne({});
    if (!caja) {
      return NextResponse.json(
        { error: "Caja no inicializada" },
        { status: 400 }
      );
    }

    const nuevoMontoActual = caja.montoActual + montoAIngresar;

    await db.collection("cajaRegistradora").updateOne(
      {},
      {
        $set: {
          montoActual: nuevoMontoActual,
          fechaActualizacion: new Date(),
        },
      }
    );

    // (Opcional) Guardar histórico de cobros si querés auditar después
    await db.collection("ingresosDiarios").insertOne({
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR"),
      montoIngresado: montoAIngresar,
      totalPedido,
      pagoCliente,
      vuelto,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al registrar cobro efectivo:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
