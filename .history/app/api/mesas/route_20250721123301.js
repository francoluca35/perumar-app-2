import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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
