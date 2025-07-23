import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = [];

    for (const doc of usersSnap.docs) {
      const user = doc.data();

      const turnosSnap = await getDocs(
        query(
          collection(db, "turnos"),
          where("username", "==", user.username),
          orderBy("inicio", "desc"),
          limit(1)
        )
      );

      const ultimoTurno = turnosSnap.docs[0]?.data();

      users.push({
        username: user.username,
        nombreCompleto: user.nombreCompleto,
        email: user.email,
        rol: user.rol,
        online: ultimoTurno?.online || false,
        inicio: ultimoTurno?.inicio?.toDate?.() || null,
        fin: ultimoTurno?.fin?.toDate?.() || null,
      });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("🔥 Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
