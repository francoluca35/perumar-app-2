import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { codigos } = await req.json();
    if (!Array.isArray(codigos) || codigos.length === 0) {
      return NextResponse.json(
        { error: "Lista de códigos vacía" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");
    const mesasDoc = await db.collection("tables").findOne({});

    // Filtrar mesas eliminando por código
    const mesaAdentro = (mesasDoc.mesaAdentro || []).filter(
      (m) => !codigos.includes(m.codigo)
    );
    const mesaAdentro2 = (mesasDoc.mesaAdentro2 || []).filter(
      (m) => !codigos.includes(m.codigo)
    );
    const mesaAfuera = (mesasDoc.mesaAfuera || []).filter(
      (m) => !codigos.includes(m.codigo)
    );

    // Renumerar globalmente
    let contador = 1;
    const renumerar = (lista, tipo) =>
      lista.map((m) => ({
        ...m,
        numero: contador,
        codigo: generarCodigoMesa(tipo, contador++),
      }));

    const nuevasAdentro = renumerar(mesaAdentro, "mesaAdentro");
    const nuevasAdentro2 = renumerar(mesaAdentro2, "mesaAdentro2");
    const nuevasAfuera = renumerar(mesaAfuera, "mesaAfuera");

    await db.collection("tables").updateOne(
      { _id: mesasDoc._id },
      {
        $set: {
          mesaAdentro: nuevasAdentro,
          mesaAdentro2: nuevasAdentro2,
          mesaAfuera: nuevasAfuera,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando mesas:", error);
    return NextResponse.json(
      { error: "Error al eliminar mesas" },
      { status: 500 }
    );
  }
}

function generarCodigoMesa(tipo, numero) {
  if (tipo === "mesaAdentro")
    return `MESA_${numero.toString().padStart(3, "0")}`;
  if (tipo === "mesaAdentro2") return `MESA_B${numero}`;
  if (tipo === "mesaAfuera") return `MESA_AF${numero}`;
  return `MESA_${numero}`;
}
