import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const snap = await getDocs(collection(db, "turnos"));
    const turnos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

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
        inicio: t.inicio?.toDate?.().toLocaleString() || "-",
        fin: t.fin?.toDate?.().toLocaleString() || "-",
        online: t.online ? "Sí" : "No",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    for (const t of snap.docs) await deleteDoc(t.ref);

    await db.collection("descargas").doc("ultima-exportacion-turnos").set({
      fecha: new Date(),
    });

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
