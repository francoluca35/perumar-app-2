import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function POST(req) {
  try {
    const data = await req.json();
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
    } = data;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([300, 500]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = 470;

    const drawText = (text, size = 10, bold = false) => {
      page.drawText(text, {
        x: 20,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= size + 4;
    };

    drawText("DELIVERY", 14, true);
    drawText(`Cliente: ${nombre}`);
    drawText(`Dirección: ${direccion}`);
    drawText(`Fecha: ${fecha}`);
    drawText(`Hora: ${hora}`);
    drawText(`Método de pago: ${metodoPago}`);
    if (observacion) drawText(`Obs: ${observacion}`);

    drawText("Productos:", 12, true);
    productos.forEach((p) => {
      drawText(`• ${p.cantidad} x ${p.nombre}`);
    });

    drawText(`TOTAL: $${total}`, 14, true);

    const pdfBytes = await pdfDoc.save();

    // Guardar localmente (opcional)
    const filePath = path.join(process.cwd(), "public", "ticket_delivery.pdf");
    fs.writeFileSync(filePath, pdfBytes);

    // Enviar a la impresora local (servidor index.js)
    await fetch("https://intent-cute-piglet.ngrok-free.app/print-delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=ticket_delivery.pdf",
      },
    });
  } catch (error) {
    console.error("Error generando o imprimiendo ticket:", error);
    return NextResponse.json(
      { error: "Error al generar ticket" },
      { status: 500 }
    );
  }
}
