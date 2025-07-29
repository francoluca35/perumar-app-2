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
      modo, // <- importante
    } = await req.json();

    const orden = Date.now();
    const ngrokURL = "https://intent-cute-piglet.ngrok-free.app"; // o localhost si estás en red local

    const tipo = modo === "delivery" ? "delivery" : "retiro";

    // 🔹 1. Enviar a servidor local para impresión
    const printRes = await fetch(`${ngrokURL}/printdelivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productos,
        mesa: {
          empleado: nombre,
          numero: direccion,
          tipoMesa: tipo === "delivery" ? "delivery" : "mostrador",
          turno: metodoPago,
        },
        orden,
        hora,
        fecha,
        tipo, // delivery o retiro
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

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ticket-${
          tipo === "delivery" ? "delivery" : "retiro"
        }-${nombre}.pdf`,
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
