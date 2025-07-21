import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const { currentUsername, newUsername, email } = await req.json();

    if (!currentUsername) {
      return NextResponse.json(
        { error: "No se proporcionó el usuario actual." },
        { status: 400 }
      );
    }

    const fieldsToUpdate = {};
    if (newUsername) fieldsToUpdate.username = newUsername;
    if (email) fieldsToUpdate.email = email;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No se enviaron campos para modificar." },
        { status: 400 }
      );
    }

    // 👇 Dynamic Import blindado
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    const result = await db
      .collection("users")
      .updateOne({ username: currentUsername }, { $set: fieldsToUpdate });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error en update-profile:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
