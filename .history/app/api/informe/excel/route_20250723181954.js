import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/firebase"; // Firestore
import { startOfWeek, startOfMonth, isAfter, Timestamp } from "date-fns";

export async function GET(req) {
  try {
    const tipo = new URL(req.url).searchParams.get("tipo") || "general";

    // ✅ Validar tipo
    const tiposPermitidos = ["semana", "mes", "todo"];
    if (!tiposPermitidos.includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const ahora = new Date();
    const inicioSemana = startOfWeek(ahora, { weekStartsOn: 1 });
    const inicioMes = startOfMonth(ahora);

    // 🔄 Obtener ingresos y retiros desde Firestore
    const ingresosSnap = await db.collection("ingresosDiarios").get();
    const retirosSnap = await db.collection("retiroEfectivo").get();

    const ingresos = ingresosSnap.docs.map((doc) => doc.data());
    const retiros = retirosSnap.docs.map((doc) => doc.data());

    const filtrarPorTipo = (fecha) => {
      const f = new Date(fecha);
      if (tipo === "semana") return isAfter(f, inicioSemana);
      if (tipo === "mes") return isAfter(f, inicioMes);
      return true; // todo
    };

    const agruparPorFecha = {};

    // 🔹 Agrupar ingresos
    for (const ingreso of ingresos) {
      const fechaRaw = retiro.timestamp?.toDate?.() || retiro.timestamp;
      if (!(fechaRaw instanceof Date) || !filtrarPorTipo(fechaRaw)) continue;

      const fecha = new Date(fechaRaw).toISOString().split("T")[0];
      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = { ingreso: 0, retiros: 0, motivos: [] };
      }
      agruparPorFecha[fecha].ingreso +=
        ingreso.totalPedido || ingreso.ingresoTotal || 0;
    }

    // 🔸 Agrupar retiros
    for (const retiro of retiros) {
      const fechaRaw = retiro.timestamp?.toDate?.() || retiro.timestamp;
      if (!fechaRaw || !filtrarPorTipo(fechaRaw)) continue;

      const fecha = new Date(fechaRaw).toISOString().split("T")[0];
      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = { ingreso: 0, retiros: 0, motivos: [] };
      }
      agruparPorFecha[fecha].retiros +=
        retiro.montoRetirado || retiro.monto || 0;
      agruparPorFecha[fecha].motivos.push(retiro.motivo || "Sin motivo");
    }

    const fechasOrdenadas = Object.keys(agruparPorFecha).sort();
    if (fechasOrdenadas.length === 0) {
      return NextResponse.json(
        { error: "No hay datos para ese período" },
        { status: 400 }
      );
    }

    // 📊 Generar Excel
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

    // 🧹 Borrar si es "mes"
    if (tipo === "mes") {
      const borrarDocs = async (colRef, desde) => {
        const snap = await colRef.where("timestamp", ">=", desde).get();
        const batch = db.batch();
        snap.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      };

      await borrarDocs(db.collection("ingresosDiarios"), inicioMes);
      await borrarDocs(db.collection("retiroEfectivo"), inicioMes);
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
