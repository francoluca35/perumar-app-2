import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Falta el username" }, { status: 400 });
    }

    const userRef = doc(db, "users", username);
    await updateDoc(userRef, {
      online: false,
      fin: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Sesión cerrada correctamente" });
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
