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

    // ⚠️ Verificar que es JSON válido
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error desde el servidor local:", errorText);
      return NextResponse.json(
        { error: "Fallo desde servidor local", detalle: errorText },
        { status: 500 }
      );
    }

    if (!contentType.includes("application/json")) {
      const rawText = await response.text();
      console.warn("⚠️ Respuesta inesperada:", rawText);
      return NextResponse.json(
        { error: "Respuesta inesperada del servidor", detalle: rawText },
        { status: 500 }
      );
    }

    // ✅ Todo OK
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error general en proxy impresión:", err);
    return NextResponse.json(
      { error: "Error general", detalle: err.message },
      { status: 500 }
    );
  }
}
