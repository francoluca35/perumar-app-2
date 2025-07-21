import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/encrypt";
import cloudinary from "@/lib/cloudinary";
import { ref, set, get, child } from "firebase/database";
import { db } from "@/lib/firebase"; // Asegurate de exportar db desde acá

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

    // 📤 Subir imagen a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "usuarios",
    });

    // 🔐 Encriptar contraseña
    const hashed = await hashPassword(password);

    // 📁 Verificar si ya existe (por username o email)
    const snapshot = await get(child(ref(db), `users`));
    const usuarios = snapshot.exists() ? snapshot.val() : {};

    const yaExiste = Object.values(usuarios).some(
      (user) => user.username === username || user.email === email
    );

    if (yaExiste) {
      return NextResponse.json(
        { error: "Usuario o email ya existe" },
        { status: 409 }
      );
    }

    // 🆔 Generar ID único para el usuario
    const userId = crypto.randomUUID();

    // 📝 Guardar en Firebase
    await set(ref(db, `users/${userId}`), {
      id: userId,
      username,
      email,
      password: hashed,
      nombreCompleto,
      rol,
      imagen: uploadResult.secure_url,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al registrar:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
