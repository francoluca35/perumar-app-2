import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import cloudinary from "@/lib/cloudinary";

async function deleteFromCloudinary(imageUrl) {
  if (!imageUrl) return;
  const parts = imageUrl.split("/");
  const filename = parts.pop().split(".")[0]; // nombre sin extensión
  const publicId = `comandas2/${filename}`;
  await cloudinary.uploader.destroy(publicId);
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const docRef = doc(db, "menus", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "No se encontró el menú" },
        { status: 404 }
      );
    }

    const data = snapshot.data();

    // Eliminar imagen si existe
    if (data.imagen) {
      await deleteFromCloudinary(data.imagen);
    }

    // Eliminar el documento
    await deleteDoc(docRef);

    return NextResponse.json({ message: "Menú eliminado" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al eliminar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor", error: error.message },
      { status: 500 }
    );
  }
}
