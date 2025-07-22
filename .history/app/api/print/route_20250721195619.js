import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      productos,
      mesa,
      orden,
      hora,
      fecha,
      metodoPago,
      ip, // Dirección IP de la impresora
    } = await req.json();

    if (!ip || !productos || productos.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos para imprimir" },
        { status: 400 }
      );
    }

    const response = await fetch(`http://${ip}:4000/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productos,
        mesa,
        orden,
        hora,
        fecha,
        metodoPago,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error desde impresora: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🖨️ Error al imprimir:", err);
    return NextResponse.json(
      { error: "Fallo al imprimir ticket" },
      { status: 500 }
    );
  }
}
