import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { codigo, usuario, hora, estado, fecha } = await req.json();

    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "No hay mesas" }, { status: 404 });
    }

    const mesas = docSnap.data();

    let tipo = null;
    if ((mesas.mesaAdentro || []).some((m) => m.codigo === codigo))
      tipo = "mesaAdentro";
    else if ((mesas.mesaAdentro2 || []).some((m) => m.codigo === codigo))
      tipo = "mesaAdentro2";
    else if ((mesas.mesaAfuera || []).some((m) => m.codigo === codigo))
      tipo = "mesaAfuera";

    if (!tipo) {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    const actualizado = mesas[tipo].map((m) =>
      m.codigo === codigo ? { ...m, usuario, hora, fecha, estado } : m
    );

    await setDoc(docRef, {
      ...mesas,
      [tipo]: actualizado,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
