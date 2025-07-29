import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      nombre,
      direccion,
      observacion,
      productos,
      total,
      hora,
      fecha,
      metodoPago,
      modo, // delivery o entregalocal
    } = await req.json();

    const orden = Date.now();
    const ngrokURL = "https://intent-cute-piglet.ngrok-free.app";

    const tipo = modo === "delivery" ? "delivery" : "retiro";

    const printRes = await fetch(`${ngrokURL}/printdelivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productos,
        mesa: {
          cliente: nombre,
          numero: direccion,
          tipoMesa: tipo === "delivery" ? "delivery" : "mostrador",
          turno: metodoPago,
        },
        orden,
        hora,
        fecha,
        tipo, // ✅ importante
      }),
    });

    if (!printRes.ok) {
      const errorText = await printRes.text();
      console.error("❌ Error al imprimir:", errorText);
      return NextResponse.json(
        { error: "Error al imprimir ticket" },
        { status: 500 }
      );
    }

    const pdfRes = await fetch(`${ngrokURL}/preview`);
    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Error al descargar PDF" },
        { status: 500 }
      );
    }

    const pdfBuffer = await pdfRes.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ticket-${tipo}-${nombre}.pdf`,
      },
    });
  } catch (error) {
    console.error("❌ Error general en /api/print/envios:", error);
    return NextResponse.json(
      { error: "Fallo en el servidor" },
      { status: 500 }
    );
  }
}
