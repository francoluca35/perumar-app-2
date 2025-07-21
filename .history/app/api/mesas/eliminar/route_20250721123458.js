import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const { codigos } = await req.json();

    if (!Array.isArray(codigos) || codigos.length === 0) {
      return NextResponse.json(
        { error: "Lista de códigos vacía" },
        { status: 400 }
      );
    }

    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "No hay mesas" }, { status: 404 });
    }

    const mesas = docSnap.data();

    const mesaAdentro = (mesas.mesaAdentro || []).filter(
      (m) => !codigos.includes(m.codigo)
    );
    const mesaAdentro2 = (mesas.mesaAdentro2 || []).filter(
      (m) => !codigos.includes(m.codigo)
    );
    const mesaAfuera = (mesas.mesaAfuera || []).filter(
      (m) => !codigos.includes(m.codigo)
    );

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

    await setDoc(docRef, {
      mesaAdentro: nuevasAdentro,
      mesaAdentro2: nuevasAdentro2,
      mesaAfuera: nuevasAfuera,
    });

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
  if (tipo === "mesaAdentro") return `MESA_${String(numero).padStart(3, "0")}`;
  if (tipo === "mesaAdentro2") return `MESA_B${numero}`;
  if (tipo === "mesaAfuera") return `MESA_AF${numero}`;
  return `MESA_${numero}`;
}
