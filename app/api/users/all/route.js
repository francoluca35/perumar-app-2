import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const users = await db.collection("users").find().toArray();

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const turno = await db
          .collection("turnos")
          .find({ username: user.username })
          .sort({ inicio: -1 })
          .limit(1)
          .toArray();

        const ultimoTurno = turno[0];

        return {
          username: user.username,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
          rol: user.rol,
          online: ultimoTurno?.online || false,
          inicio: ultimoTurno?.inicio || null,
          fin: ultimoTurno?.fin || null,
        };
      })
    );

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("🔥 Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
