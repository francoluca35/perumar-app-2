// app/api/turnos/checkexport/route.js
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const config = await db
      .collection("configuracion")
      .findOne({ _id: "exportacionTurnos" });
    const ultima = config?.ultimaExportacion
      ? new Date(config.ultimaExportacion)
      : null;
    const ahora = new Date();

    const diasPasados = ultima
      ? Math.floor((ahora - ultima) / (1000 * 60 * 60 * 24))
      : 999;

    return NextResponse.json({ diasPasados });
  } catch (error) {
    console.error("🔥 Error en checkexport:", error);
    return NextResponse.json(
      { error: "Error en checkexport" },
      { status: 500 }
    );
  }
}
