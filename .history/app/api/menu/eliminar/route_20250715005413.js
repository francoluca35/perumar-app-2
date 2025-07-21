import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";

// Elimina imagen desde Cloudinary
async function deleteFromCloudinary(imageUrl) {
  if (!imageUrl) return;
  const parts = imageUrl.split("/");
  const publicIdWithExt = parts[parts.length - 1]; // nombre.ext
  const publicId = `comandas/${publicIdWithExt.split(".")[0]}`;
  await cloudinary.uploader.destroy(publicId);
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    // Buscar el menú antes de eliminarlo
    const menu = await db
      .collection("menus")
      .findOne({ _id: new ObjectId(id) });

    if (!menu) {
      return NextResponse.json(
        { message: "No se encontró el menú" },
        { status: 404 }
      );
    }

    // Eliminar imagen si existe
    if (menu.imagen) {
      await deleteFromCloudinary(menu.imagen);
    }

    // Eliminar de MongoDB
    const result = await db
      .collection("menus")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Menú eliminado" }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Error al eliminar" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al eliminar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
