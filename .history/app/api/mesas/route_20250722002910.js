import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

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
      tipoMesa, // 'mesaAdentro', 'mesaAdentro2', 'mesaAfuera'
    } = await req.json();

    if (!codigo || !numero || !tipoMesa) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // 🔄 Solo actualizamos el documento global en 'tables/estadoMesas'
    const estadoRef = doc(db, "tables", "estadoMesas");
    const estadoSnap = await getDoc(estadoRef);

    if (!estadoSnap.exists()) {
      return NextResponse.json(
        { error: "No se encontró el documento estadoMesas" },
        { status: 404 }
      );
    }

    const data = estadoSnap.data();
    const mesas = data[tipoMesa];

    const index = mesas.findIndex((m) => m.codigo === codigo);
    if (index !== -1) {
      mesas[index] = {
        ...mesas[index],
        numero,
        productos,
        metodoPago,
        total,
        estado,
        hora,
        fecha,
      };
    }

    await updateDoc(estadoRef, {
      [tipoMesa]: mesas,
    });

    return NextResponse.json({ message: "Mesa actualizada correctamente" });
  } catch (err) {
    console.error("Error al guardar la mesa:", err);
    return NextResponse.json(
      { error: "Error al guardar la mesa" },
      { status: 500 }
    );
  }
}
