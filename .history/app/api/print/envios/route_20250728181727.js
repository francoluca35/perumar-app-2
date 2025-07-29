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
      modo,
    } = await req.json();

    const orden = Date.now();
    const ngrokURL = "https://intent-cute-piglet.ngrok-free.app";

    // ✅ 1. Enviar ticket al servidor local para imprimir
    const printRes = await fetch(`${ngrokURL}/printdelivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productos,
        mesa: {
          empleado: nombre,
          numero: direccion,
          tipoMesa: modo === "delivery" ? "delivery" : "mostrador",
          turno: metodoPago,
        },
        orden,
        hora,
        fecha,
        modo,
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

    // ✅ 2. Descargar el PDF desde ngrok (no localhost)
    const pdfRes = await fetch(`${ngrokURL}/preview`);
    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Error al descargar PDF" },
        { status: 500 }
      );
    }

    const pdfArrayBuffer = await pdfRes.arrayBuffer();
    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=delivery-${nombre}.pdf`,
      },
    });
  } catch (error) {
    console.error("❌ Error en API /print/envios:", error);
    return NextResponse.json(
      { error: "Fallo en el servidor" },
      { status: 500 }
    );
  }
}
