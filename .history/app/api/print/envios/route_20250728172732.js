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

    // ✅ 1. Enviar ticket al servidor local para imprimir
    const printRes = await fetch("http://localhost:4000/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa: {
          empleado: nombre,
          tipoMesa: modo === "envio" ? "delivery" : "local",
          numero: direccion,
          turno: metodoPago,
        },
        productos,
        orden,
        hora,
        fecha,
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

    // ✅ 2. Descargar el PDF generado
    const pdfRes = await fetch("http://localhost:4000/preview");
    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Error al descargar PDF" },
        { status: 500 }
      );
    }

    const pdfBlob = await pdfRes.blob();
    return new NextResponse(pdfBlob, {
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
