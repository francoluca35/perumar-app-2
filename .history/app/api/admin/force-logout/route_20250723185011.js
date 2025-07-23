import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();

    const q = query(
      collection(db, "turnos"),
      where("username", "==", username),
      where("online", "==", true),
      orderBy("inicio", "desc"),
      limit(1)
    );

    const snap = await getDocs(q);
    const docRef = snap.docs[0]?.ref;

    if (docRef) {
      await updateDoc(docRef, {
        fin: new Date(),
        online: false,
      });
    }

    return NextResponse.json({ message: "Sesión forzada cerrada" });
  } catch (error) {
    console.error("🔥 Error al cerrar sesión forzada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
