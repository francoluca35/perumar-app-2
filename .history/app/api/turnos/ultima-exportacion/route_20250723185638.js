import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const docRef = doc(db, "descargas", "ultima-exportacion-turnos");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ fecha: null });
    }

    const data = docSnap.data();
    const fecha = data.fecha?.toDate?.() || null;

    return NextResponse.json({ fecha });
  } catch (error) {
    console.error("Error obteniendo última exportación:", error);
    return NextResponse.json(
      { error: "Error obteniendo última exportación" },
      { status: 500 }
    );
  }
}
