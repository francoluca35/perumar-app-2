import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Falta el username" }, { status: 400 });
    }

    // Buscar el documento del usuario por username
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();
    const userRef = userDoc.ref;

    const fin = new Date().toISOString();

    // 🔴 1. Actualizar el usuario: ponerlo offline y guardar hora de cierre
    await updateDoc(userRef, {
      online: false,
      fin,
    });

    // 🟡 2. Guardar en la colección "turnos"
    await addDoc(collection(db, "turnos"), {
      username,
      inicio: userData.inicio || null,
      fin,
      nombre: userData.nombreCompleto || "",
      email: userData.email || "",
      rol: userData.rol || "",
      creadoEn: new Date(),
    });

    return NextResponse.json({ message: "Turno cerrado correctamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
