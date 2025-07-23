import { db } from "@/lib/firebase";
import { collection, doc, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Falta el username" }, { status: 400 });
    }

    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    const fin = new Date().toISOString();

    // 🔴 1. Actualizar usuario: ponerlo offline y guardar hora de cierre
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
