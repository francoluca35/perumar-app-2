import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const { tipo, cantidad } = await req.json();

    const tiposValidos = ["mesaAdentro", "mesaAdentro2", "mesaAfuera"];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    if (!cantidad || typeof cantidad !== "number" || cantidad <= 0) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }

    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "No hay mesas" }, { status: 404 });
    }

    const mesas = docSnap.data();
    const existentes = mesas[tipo] || [];

    const nuevas = existentes.slice(
      0,
      Math.max(0, existentes.length - cantidad)
    );

    await setDoc(docRef, {
      ...mesas,
      [tipo]: nuevas,
    });

    return NextResponse.json({
      success: true,
      message: "Mesas eliminadas correctamente",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
