import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json([docSnap.data()]);
    } else {
      return NextResponse.json([
        { mesaAdentro: [], mesaAdentro2: [], mesaAfuera: [] },
      ]);
    }
  } catch (error) {
    console.error("Error al obtener mesas:", error);
    return NextResponse.json(
      { error: "Error al obtener las mesas" },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  try {
    const {
      codigo,
      numero,
      productos,
      metodoPago,
      total,
      estado,
      hora,
      fecha,
    } = await req.json();

    if (!codigo || !numero) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const mesaRef = doc(db, "mesas", codigo);
    await setDoc(mesaRef, {
      numero,
      productos,
      metodoPago,
      total,
      estado,
      hora,
      fecha,
    });

    return NextResponse.json({ message: "Mesa actualizada con éxito" });
  } catch (err) {
    console.error("Error al guardar la mesa:", err);
    return NextResponse.json(
      { error: "Error al guardar la mesa" },
      { status: 500 }
    );
  }
}
