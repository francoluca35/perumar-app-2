import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export async function POST(req) {
  try {
    const { username } = await req.json();

    const q = query(
      collection(db, "turnos"),
      where("username", "==", username),
      where("online", "==", true)
    );

    const snap = await getDocs(q);
    if (snap.empty)
      return NextResponse.json({ message: "No hay turno activo" });

    const docRef = snap.docs[0].ref;

    await updateDoc(docRef, {
      online: false,
      fin: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Turno cerrado" });
  } catch (err) {
    console.error("Error al cerrar turno:", err);
    return NextResponse.json(
      { error: "Error al cerrar turno" },
      { status: 500 }
    );
  }
}
