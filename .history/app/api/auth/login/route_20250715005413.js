import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

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

    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // ✅ Evitar duplicado de turno activo
    const turnoExistente = await db.collection("turnos").findOne({
      username: user.username,
      online: true,
    });

    if (!turnoExistente) {
      await db.collection("turnos").insertOne({
        userId: user._id ?? new ObjectId(),
        username: user.username,
        inicio: new Date(),
        online: true,
        createdAt: new Date(),
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
