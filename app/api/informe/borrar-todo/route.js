import { db } from "@/lib/firebase";
import { deleteDoc, collection, getDocs, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const ingresosSnap = await getDocs(collection(db, "ingresosDiarios"));
    const retirosSnap = await getDocs(collection(db, "retiroEfectivo"));

    for (const ingreso of ingresosSnap.docs) {
      await deleteDoc(doc(db, "ingresosDiarios", ingreso.id));
    }

    for (const retiro of retirosSnap.docs) {
      await deleteDoc(doc(db, "retiroEfectivo", retiro.id));
    }

    return NextResponse.json({ message: "Datos eliminados con éxito" });
  } catch (error) {
    console.error("Error al borrar datos:", error);
    return NextResponse.json(
      { error: "Error al borrar datos" },
      { status: 500 }
    );
  }
}
