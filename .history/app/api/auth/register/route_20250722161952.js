import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/encrypt";
import cloudinary from "@/lib/cloudinary";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

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

    // 📷 Subir imagen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "usuarios",
    });

    // 🔐 Encriptar password
    const hashed = await hashPassword(password);

    // 📦 Verificar duplicados
    const snapshot = await getDocs(collection(firestore, "users"));

    const yaExiste = snapshot.docs.some((doc) => {
      const data = doc.data();
      return data.username === username || data.email === email;
    });

    if (yaExiste) {
      return NextResponse.json(
        { error: "Usuario o email ya existe" },
        { status: 409 }
      );
    }

    // 📝 Guardar
    const id = crypto.randomUUID();
    await setDoc(doc(db, "users", id), {
      id,
      username,
      email,
      password: hashed,
      nombreCompleto,
      rol,
      imagen: uploadResult.secure_url,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al registrar:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
