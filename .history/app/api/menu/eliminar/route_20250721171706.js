import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const docRef = doc(db, "menus", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { message: "No se encontró el menú" },
        { status: 404 }
      );
    }

    const menu = docSnap.data();

    // Eliminar imagen si existe
    if (menu.imagen) {
      const parts = menu.imagen.split("/");
      const publicIdWithExt = parts[parts.length - 1]; // nombre.ext
      const publicId = `comandas2/${publicIdWithExt.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }

    // Eliminar documento en Firestore
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
