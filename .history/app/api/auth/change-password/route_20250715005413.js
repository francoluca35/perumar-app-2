import { NextResponse } from "next/server";
import { comparePassword, hashPassword } from "@/utils/encrypt";

export async function PUT(req) {
  try {
    const { username, oldPassword, newPassword } = await req.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // Import dinámico de clientPromise
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const match = await comparePassword(oldPassword, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta." },
        { status: 401 }
      );
    }

    const hashedNew = await hashPassword(newPassword);

    await db
      .collection("users")
      .updateOne({ username }, { $set: { password: hashedNew } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Error en change-password:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
