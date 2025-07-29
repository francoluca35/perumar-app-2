import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://intent-cute-piglet.ngrok-free.app/print",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const contentType = response.headers.get("content-type") || "";

    // Si no fue exitoso o no es JSON, mostrar el texto devuelto
    if (!response.ok || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("❌ Respuesta no válida del servidor:", errorText);
      return NextResponse.json(
        { error: "Respuesta no válida del servidor", detalle: errorText },
        { status: 500 }
      );
    }

    // Si es JSON válido, seguimos
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error al conectar con servidor local:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel", detalle: err.message },
      { status: 500 }
    );
  }
}
