import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();

    // Dinámicamente importamos clientPromise en runtime
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("users").deleteOne({ username });
    await db.collection("turnos").deleteMany({ username });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("🔥 Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
