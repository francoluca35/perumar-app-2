import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/encrypt";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("foto");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const nombreCompleto = formData.get("nombreCompleto");
    const rol = formData.get("rol");

    if (!file || !username || !email || !password || !nombreCompleto || !rol) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "usuarios",
    });

    // 👇 Import dinámico de clientPromise
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    const existe = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existe) {
      return NextResponse.json(
        { error: "Usuario o email ya existe" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    await db.collection("users").insertOne({
      username,
      email,
      password: hashed,
      nombreCompleto,
      rol,
      imagen: uploadResult.secure_url,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al registrar:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
