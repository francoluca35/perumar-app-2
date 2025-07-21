import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    if (!ingresos.length && !retiros.length) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    // Crear Excel workbook y hoja
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Informe Diario");

    // Encabezados
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Ingreso", key: "ingreso", width: 15 },
      { header: "Retiros", key: "retiros", width: 15 },
      { header: "Neto", key: "neto", width: 15 },
    ];

    // Filas
    ingresos.forEach((i) => {
      const fecha =
        i.fecha instanceof Date
          ? i.fecha.toISOString().split("T")[0]
          : i.fecha || "-";

      const ingreso = i.ingresoTotal ?? 0;

      const fechaRetiros = (date) => new Date(date).toISOString().split("T")[0]; // convierte a YYYY-MM-DD

      const retirosDeEseDia = retiros.filter(
        (r) => fechaRetiros(r.timestamp) === fecha
      );

      const totalRetiros = retirosDeEseDia.reduce(
        (acc, r) => acc + (r.montoRetirado || 0),
        0
      );

      worksheet.addRow({
        fecha,
        ingreso,
        retiros: totalRetiros,
        neto: ingreso - totalRetiros,
      });
    });

    // Guardar en buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Eliminar datos después de exportar
    await db.collection("ingresosDiarios").deleteMany({});
    await db.collection("retiroEfectivo").deleteMany({});

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=informe-diario.xlsx",
      },
    });
  } catch (err) {
    console.error("Error exportando Excel:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
