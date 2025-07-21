import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const nombre = formData.get("nombre");
    const tipo = formData.get("tipo");
    const precio = parseFloat(formData.get("precio"));
    const descuento = formData.get("descuento");
    const adicionalesStr = formData.get("adicionales");
    const alcohol = formData.get("alcohol");
    const categoria = formData.get("categoria");

    if (!file || !nombre || !tipo || isNaN(precio)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const adicionales = adicionalesStr ? JSON.parse(adicionalesStr) : [];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "menus",
    });

    const client = await clientPromise;
    const db = client.db("comandas");

    const nuevoMenu = {
      nombre,
      tipo,
      precio,
      descuento: descuento ? parseFloat(descuento) : undefined,
      adicionales,
      imagen: uploadResult.secure_url,
      creado: new Date(),
    };

    if (tipo === "bebida") {
      nuevoMenu.alcohol = alcohol === "true";
    }

    if (tipo === "comida") {
      nuevoMenu.categoria = categoria;
    }

    const result = await db.collection("menus").insertOne(nuevoMenu);

    return NextResponse.json(
      { message: "Menú agregado correctamente", id: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error al agregar menú:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
