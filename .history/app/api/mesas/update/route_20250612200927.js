import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { codigo, usuario, hora, estado, fecha } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});

    // Buscamos a qué grupo pertenece la mesa
    let tipo = null;

    if (mesasDoc.mesaAdentro.some((m) => m.codigo === codigo)) {
      tipo = "mesaAdentro";
    } else if (mesasDoc.mesaAdentro2.some((m) => m.codigo === codigo)) {
      tipo = "mesaAdentro2";
    } else if (mesasDoc.mesaAfuera.some((m) => m.codigo === codigo)) {
      tipo = "mesaAfuera";
    } else {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    // Actualizamos la mesa dentro del array correspondiente
    const mesasActualizadas = mesasDoc[tipo].map((mesa) =>
      mesa.codigo === codigo ? { ...mesa, usuario, hora, fecha, estado } : mesa
    );

    await db
      .collection("tables")
      .updateOne(
        { _id: mesasDoc._id },
        { $set: { [tipo]: mesasActualizadas } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
