import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://right-worthy-collie.ngrok-free.app/print",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    let data;
    try {
      data = await response.json(); // Intenta parsear JSON
    } catch (parseError) {
      const rawText = await response.text(); // Si falla, obtené el texto
      console.error("⚠️ Respuesta inesperada (no JSON):", rawText);
      return NextResponse.json(
        {
          success: false,
          error: "La impresora no respondió con JSON válido.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error al conectar con servidor local:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel o red" },
      { status: 500 }
    );
  }
}
