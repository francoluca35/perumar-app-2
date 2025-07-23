import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectToDatabase } from "@/lib/db";
import { startOfWeek, startOfMonth, isAfter, isSameMonth } from "date-fns";

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const tipo = new URL(req.url).searchParams.get("tipo") || "general";

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const ahora = new Date();
    const inicioSemana = startOfWeek(ahora, { weekStartsOn: 1 });
    const inicioMes = startOfMonth(ahora);

    const filtrarPorTipo = (fecha) => {
      const f = new Date(fecha);
      if (tipo === "semana") return isAfter(f, inicioSemana);
      if (tipo === "mes") return isAfter(f, inicioMes);
      return true;
    };

    const agruparPorFecha = {};

    for (const ingreso of ingresos) {
      if (!ingreso.timestamp || !filtrarPorTipo(ingreso.timestamp)) continue;
      const fecha = new Date(ingreso.timestamp).toISOString().split("T")[0];
      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = { ingreso: 0, retiros: 0, motivos: [] };
      }
      agruparPorFecha[fecha].ingreso += ingreso.totalPedido || 0;
    }

    for (const retiro of retiros) {
      if (!retiro.timestamp || !filtrarPorTipo(retiro.timestamp)) continue;
      const fecha = new Date(retiro.timestamp).toISOString().split("T")[0];
      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = { ingreso: 0, retiros: 0, motivos: [] };
      }
      agruparPorFecha[fecha].retiros += retiro.montoRetirado || 0;
      agruparPorFecha[fecha].motivos.push(retiro.motivo || "Sin motivo");
    }

    const fechasOrdenadas = Object.keys(agruparPorFecha).sort();
    if (fechasOrdenadas.length === 0) {
      return NextResponse.json(
        { error: "No hay datos para ese período" },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Informe");

    sheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Ingresos", key: "ingreso", width: 15 },
      { header: "Retiros", key: "retiros", width: 15 },
      { header: "Motivos de Retiros", key: "motivos", width: 40 },
      { header: "Neto", key: "neto", width: 15 },
    ];

    fechasOrdenadas.forEach((fecha) => {
      const { ingreso, retiros, motivos } = agruparPorFecha[fecha];
      sheet.addRow({
        fecha,
        ingreso,
        retiros,
        motivos: motivos.join(", "),
        neto: ingreso - retiros,
      });
    });

    sheet.eachRow((row, i) => {
      row.alignment = { vertical: "middle", horizontal: "center" };
      if (i === 1) row.font = { bold: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // ✅ ELIMINAR INGRESOS Y RETIROS del mes actual si tipo es "mes"
    if (tipo === "mes") {
      await db.collection("ingresosDiarios").deleteMany({
        timestamp: { $gte: inicioMes, $lt: new Date() },
      });

      await db.collection("retiroEfectivo").deleteMany({
        timestamp: { $gte: inicioMes, $lt: new Date() },
      });
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=informe-${tipo}.xlsx`,
      },
    });
  } catch (err) {
    console.error("Error generando Excel:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
