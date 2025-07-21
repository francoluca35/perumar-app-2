import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const registro = await db.collection("descargas").findOne({
      _id: "ultima-exportacion-turnos",
    });

    if (!registro?.fecha) {
      return NextResponse.json({ diasDesdeUltima: 9999 });
    }

    const ahora = new Date();
    const ultima = new Date(registro.fecha);
    const diffDias = Math.floor((ahora - ultima) / (1000 * 60 * 60 * 24));

    return NextResponse.json({ diasDesdeUltima: diffDias });
  } catch (err) {
    console.error("Error al obtener fecha de exportación:", err);
    return NextResponse.json({ diasDesdeUltima: 9999 });
  }
}
