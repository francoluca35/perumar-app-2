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
    const tipo = modo === "delivery" ? "delivery" : "retiro";
    const ngrokURL = "https://intent-cute-piglet.ngrok-free.app"; // o http://localhost:4000

    // 🖨️ Enviar al servidor local para impresión
    const printRes = await fetch(`${ngrokURL}/printdelivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productos,
        mesa: {
          empleado: nombre,
          numero: direccion,
          tipoMesa: tipo,
          turno: metodoPago,
        },
        orden,
        hora,
        fecha,
        tipo,
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

    // ✅ Respuesta exitosa (sin descarga de PDF)
    return NextResponse.json({
      success: true,
      message: "Ticket impreso correctamente",
    });
  } catch (error) {
    console.error("❌ Error general en /api/print/envios:", error);
    return NextResponse.json(
      { error: "Fallo en el servidor interno" },
      { status: 500 }
    );
  }
}
