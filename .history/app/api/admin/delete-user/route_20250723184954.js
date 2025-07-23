import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();

    const userDoc = doc(db, "users", username);
    await deleteDoc(userDoc);

    const q = query(
      collection(db, "turnos"),
      where("username", "==", username)
    );
    const snap = await getDocs(q);
    const batchDeletes = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(batchDeletes);

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("🔥 Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
