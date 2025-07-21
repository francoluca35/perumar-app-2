// app/api/turnos/exportar/route.js
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const turnos = await db.collection("turnos").find().toArray();

    if (turnos.length === 0) {
      return NextResponse.json(
        { error: "No hay turnos para exportar" },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Turnos");

    sheet.columns = [
      { header: "Usuario", key: "username", width: 20 },
      { header: "Inicio", key: "inicio", width: 25 },
      { header: "Fin", key: "fin", width: 25 },
      { header: "Online", key: "online", width: 10 },
    ];

    turnos.forEach((t) => {
      sheet.addRow({
        username: t.username,
        inicio: t.inicio ? new Date(t.inicio).toLocaleString() : "-",
        fin: t.fin ? new Date(t.fin).toLocaleString() : "-",
        online: t.online ? "Sí" : "No",
      });
    });

    // Convertir a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Eliminar los turnos de la colección
    await db.collection("turnos").deleteMany({});

    await db
      .collection("descargas")
      .updateOne(
        { _id: "ultima-exportacion-turnos" },
        { $set: { fecha: new Date() } },
        { upsert: true }
      );
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=turnos.xlsx",
      },
    });
  } catch (error) {
    console.error("Error exportando turnos:", error);
    return NextResponse.json(
      { error: "Error exportando turnos" },
      { status: 500 }
    );
  }
}
