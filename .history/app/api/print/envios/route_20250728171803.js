import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Para nombre de archivo único
const generarNombreArchivo = () => {
  const now = new Date();
  return `ticket_delivery_${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}_${now.getTime()}.pdf`;
};

export async function POST(req) {
  try {
    const {
      nombre,
      direccion,
      productos,
      total,
      fecha,
      hora,
      metodoPago,
      modo,
      observacion,
    } = await req.json();

    // 1. Crear PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([250, 600]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 580;

    const drawText = (text, size = 10, bold = false) => {
      page.drawText(text, {
        x: 20,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= size + 5;
    };

    drawText("DELIVERY", 14);
    drawText(`Cliente: ${nombre}`);
    drawText(`Dirección: ${direccion}`);
    drawText(`Fecha: ${fecha} - ${hora}`);
    drawText(`Forma de pago: ${metodoPago}`);
    if (observacion) drawText(`Obs: ${observacion}`);

    drawText("------------------------------");

    productos.forEach((p) => {
      drawText(`${p.cantidad}x ${p.nombre}`);
    });

    drawText("------------------------------");
    drawText(`TOTAL: $${total}`, 12);

    const pdfBytes = await pdfDoc.save();

    // 2. Enviar a impresora local por Ngrok
    await fetch("https://intent-cute-piglet.ngrok-free.app/print-delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        direccion,
        productos,
        total,
        fecha,
        hora,
        metodoPago,
        modo,
        observacion,
      }),
    });

    // 3. Devolver PDF para descargar
    const nombreArchivo = generarNombreArchivo();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    });
  } catch (error) {
    console.error("Error generando o imprimiendo ticket:", error);
    return NextResponse.json(
      { error: "Error al generar o imprimir ticket" },
      { status: 500 }
    );
  }
}
