// app/api/mesas/agregar/route.ts
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tipo, cantidad } = await req.json();
    const tipoSanitizado = tipo.trim();
    const tiposValidos = ["mesaAdentro", "mesaAdentro2", "mesaAfuera"];

    if (!tiposValidos.includes(tipoSanitizado)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);

    const mesas = docSnap.exists()
      ? docSnap.data()
      : {
          mesaAdentro: [],
          mesaAdentro2: [],
          mesaAfuera: [],
        };

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
          ? [...mesas.mesaAdentro, ...nuevasMesas]
          : mesas.mesaAdentro,
      mesaAdentro2:
        tipoSanitizado === "mesaAdentro2"
          ? [...mesas.mesaAdentro2, ...nuevasMesas]
          : mesas.mesaAdentro2,
      mesaAfuera:
        tipoSanitizado === "mesaAfuera"
          ? [...mesas.mesaAfuera, ...nuevasMesas]
          : mesas.mesaAfuera,
    };

    // Renumerar todas
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

    await setDoc(docRef, actualizado);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error agregando mesas:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

function generarCodigoMesa(tipo: string, numero: number) {
  if (tipo === "mesaAdentro")
    return `MESA_${numero.toString().padStart(3, "0")}`;
  if (tipo === "mesaAdentro2") return `MESA_B${numero}`;
  if (tipo === "mesaAfuera") return `MESA_AF${numero}`;
  return `MESA_${numero}`;
}
