import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ref = doc(db, "descargas", "ultima-exportacion-turnos");
    const snap = await getDoc(ref);

    const fecha = snap.data()?.fecha?.toDate?.();
    if (!fecha) return NextResponse.json({ diasDesdeUltima: 9999 });

    const ahora = new Date();
    const diffDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));
    return NextResponse.json({ diasDesdeUltima: diffDias });
  } catch (err) {
    console.error("Error al obtener fecha de exportación:", err);
    return NextResponse.json({ diasDesdeUltima: 9999 });
  }
}
