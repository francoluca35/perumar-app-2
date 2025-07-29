import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req) {
  const {
    nombre,
    direccion,
    observacion,
    productos,
    total,
    hora,
    fecha,
    metodoPago,
  } = await req.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([300, 500]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  let y = height - 30;
  page.drawText("🚚 PEDIDO DELIVERY", { x: 20, y, size: 14, font });

  y -= 20;
  page.drawText(`Cliente: ${nombre}`, { x: 20, y, size: 10, font });
  y -= 15;
  page.drawText(`Dirección: ${direccion}`, { x: 20, y, size: 10, font });
  y -= 15;
  page.drawText(`Fecha: ${fecha} - Hora: ${hora}`, {
    x: 20,
    y,
    size: 10,
    font,
  });
  y -= 15;
  page.drawText(`Método de Pago: ${metodoPago}`, { x: 20, y, size: 10, font });

  y -= 20;
  page.drawText("Productos:", { x: 20, y, size: 10, font });

  productos.forEach((item) => {
    y -= 15;
    page.drawText(`• ${item.cantidad}x ${item.nombre}`, {
      x: 30,
      y,
      size: 10,
      font,
    });
  });

  if (observacion) {
    y -= 20;
    page.drawText(`📝 Obs: ${observacion}`, { x: 20, y, size: 10, font });
  }

  y -= 20;
  page.drawText(`💰 Total: $${total.toFixed(2)}`, {
    x: 20,
    y,
    size: 12,
    font,
    color: rgb(0, 0.5, 0),
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pedido-${nombre}.pdf"`,
    },
  });
}
