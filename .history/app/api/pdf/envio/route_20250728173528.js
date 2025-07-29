import { NextResponse } from "next/server";

// Esta API descarga el PDF generado por el servidor local en la ruta /preview
export async function GET() {
  try {
    const pdfRes = await fetch("http://localhost:4000/preview");

    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Error al descargar PDF" },
        { status: 500 }
      );
    }

    const arrayBuffer = await pdfRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=delivery-ticket.pdf",
      },
    });
  } catch (error) {
    console.error("❌ Error descargando PDF:", error);
    return NextResponse.json(
      { error: "Fallo al obtener el PDF" },
      { status: 500 }
    );
  }
}
