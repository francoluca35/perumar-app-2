import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:4000/preview");

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo obtener el PDF desde el servidor local" },
        { status: 500 }
      );
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ticket-delivery.pdf"',
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("❌ Error descargando el PDF:", error);
    return NextResponse.json(
      { error: "Fallo al descargar el PDF" },
      { status: 500 }
    );
  }
}
