import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseuser"; // FIRESTORE
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.text();
    const { username, password } = JSON.parse(body);

    if (!username || !password) {
      return NextResponse.json(
        { error: "Faltan credenciales" },
        { status: 400 }
      );
    }

    // 🔍 Buscar usuario en Firestore
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    // 🔐 Comparar contraseñas
    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 🟢 Verificar si ya hay un turno activo
    const turnoQuery = query(
      collection(db, "turnos"),
      where("username", "==", user.username),
      where("online", "==", true)
    );
    const turnoSnap = await getDocs(turnoQuery);

    if (turnoSnap.empty) {
      await addDoc(collection(db, "turnos"), {
        userId: user.id ?? userDoc.id,
        username: user.username,
        inicio: new Date().toISOString(),
        online: true,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      user: {
        username: user.username,
        email: user.email,
        rol: user.rol,
        nombreCompleto: user.nombreCompleto,
        imagen: user.imagen,
      },
    });
  } catch (error) {
    console.error("🔥 Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
