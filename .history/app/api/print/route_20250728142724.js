import { NextResponse } from "next/server";

// Enviamos el pedido al servidor local del LOCAL 2 (u otro) mediante NGROK
export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "generous-sheep-romantic.ngrok-free.app/print",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error al conectar con servidor local:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel" },
      { status: 500 }
    );
  }
}
