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
      mesero,
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

    const estadoRef = doc(db, "tables", "estadoMesas");
    const estadoSnap = await getDoc(estadoRef);

    if (!estadoSnap.exists()) {
      return NextResponse.json(
        { error: "No se encontró el documento estadoMesas" },
        { status: 404 }
      );
    }

    const data = estadoSnap.data();
    let mesas = data[tipoMesa];

    if (!Array.isArray(mesas)) {
      mesas = [];
    }

    const index = mesas.findIndex((m) => m.codigo === codigo);

    if (index !== -1) {
      mesas[index] = {
        ...mesas[index],
        numero,
        productos,
        metodoPago,
        mesero,
        total,
        estado,
        hora,
        fecha,
      };
    } else {
      // Si no existe la mesa, la agregamos
      mesas.push({
        codigo,
        numero,
        productos,
        metodoPago,
        mesero,
        total,
        estado,
        hora,
        fecha,
      });
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
export async function GET() {
  try {
    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // ✅ Aseguramos estructura mínima
      return NextResponse.json([
        {
          mesaAdentro: Array.isArray(data.mesaAdentro) ? data.mesaAdentro : [],
          mesaAdentro2: Array.isArray(data.mesaAdentro2)
            ? data.mesaAdentro2
            : [],
          mesaAfuera: Array.isArray(data.mesaAfuera) ? data.mesaAfuera : [],
        },
      ]);
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
