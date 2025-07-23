import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { total } = await req.json();

    if (typeof total !== "number") {
      return NextResponse.json({ error: "Total inválido" }, { status: 400 });
    }

    const cajaRef = doc(db, "cajaRegistradora", "estado");
    const cajaSnap = await getDoc(cajaRef);

    if (cajaSnap.exists()) {
      await updateDoc(cajaRef, {
        montoActual: (cajaSnap.data().montoActual || 0) + total,
        fechaActualizacion: Timestamp.now(),
      });
    } else {
      await setDoc(cajaRef, {
        montoActual: total,
        fechaActualizacion: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error al sumar en caja:", err);
    return NextResponse.json(
      { error: "Error al sumar en caja" },
      { status: 500 }
    );
  }
}
