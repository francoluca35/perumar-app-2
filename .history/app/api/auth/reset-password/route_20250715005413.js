import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/encrypt";
import { verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token o nueva contraseña faltante" },
        { status: 400 }
      );
    }

    const decoded = verify(token, JWT_SECRET);

    // 👇 Dynamic Import blindado de clientPromise
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    const hashed = await hashPassword(newPassword);

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { password: hashed } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No se pudo actualizar la contraseña" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 400 }
    );
  }
}
