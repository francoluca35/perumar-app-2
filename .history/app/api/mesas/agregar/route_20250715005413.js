import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { tipo, cantidad } = await req.json();
    const tipoSanitizado = tipo.trim();

    const tiposValidos = ["mesaAdentro", "mesaAdentro2", "mesaAfuera"];
    if (!tiposValidos.includes(tipoSanitizado)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});
    const mesaAdentro = mesasDoc.mesaAdentro || [];
    const mesaAdentro2 = mesasDoc.mesaAdentro2 || [];
    const mesaAfuera = mesasDoc.mesaAfuera || [];

    // Añadir nuevas mesas al tipo correspondiente
    const nuevasMesas = Array.from({ length: cantidad }, () => ({
      estado: "libre",
      cliente: null,
      productos: [],
      metodoPago: "",
      total: 0,
      hora: "",
      fecha: "",
    }));

    const actualizado = {
      mesaAdentro:
        tipoSanitizado === "mesaAdentro"
          ? [...mesaAdentro, ...nuevasMesas]
          : mesaAdentro,
      mesaAdentro2:
        tipoSanitizado === "mesaAdentro2"
          ? [...mesaAdentro2, ...nuevasMesas]
          : mesaAdentro2,
      mesaAfuera:
        tipoSanitizado === "mesaAfuera"
          ? [...mesaAfuera, ...nuevasMesas]
          : mesaAfuera,
    };

    // Renumerar TODAS las mesas
    let contador = 1;

    const renumerar = (lista, tipo) =>
      lista.map((m) => ({
        ...m,
        numero: contador,
        codigo: generarCodigoMesa(tipo, contador++),
      }));

    actualizado.mesaAdentro = renumerar(actualizado.mesaAdentro, "mesaAdentro");
    actualizado.mesaAdentro2 = renumerar(
      actualizado.mesaAdentro2,
      "mesaAdentro2"
    );
    actualizado.mesaAfuera = renumerar(actualizado.mesaAfuera, "mesaAfuera");

    await db.collection("tables").updateOne(
      { _id: mesasDoc._id },
      {
        $set: {
          mesaAdentro: actualizado.mesaAdentro,
          mesaAdentro2: actualizado.mesaAdentro2,
          mesaAfuera: actualizado.mesaAfuera,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error agregando mesas:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
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
