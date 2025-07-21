import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { IncomingForm } from "formidable";
import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convertir ReadableStream a Node.js Readable
async function streamToNodeReadable(readableStream) {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });
}

// Subir imagen nueva
async function uploadToCloudinary(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "comandas2",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
}

// Borrar imagen vieja
async function deleteFromCloudinary(imageUrl) {
  const parts = imageUrl.split("/");
  const publicIdWithExtension = parts[parts.length - 1];
  const publicId = `comandas2/${publicIdWithExtension.split(".")[0]}`;
  await cloudinary.uploader.destroy(publicId);
}

// 🔧 PUT
export async function PUT(req) {
  try {
    const nodeReq = await streamToNodeReadable(req.body);
    nodeReq.headers = Object.fromEntries(req.headers.entries());
    nodeReq.method = req.method;

    const form = new IncomingForm({ keepExtensions: true });

    const data = await new Promise((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    const id = fields.id?.[0];
    const nombre = fields.nombre?.[0];
    const tipo = fields.tipo?.[0];
    const precio = parseFloat(fields.precio?.[0]);
    const precioConIVA = parseFloat(fields.precioConIVA?.[0]);
    const descuento = parseFloat(fields.descuento?.[0]);
    const descuentoFinal = isNaN(descuento) ? 0 : descuento;

    const adicionales = fields.adicionales?.[0]
      ? JSON.parse(fields.adicionales[0])
      : [];
    const categoria = fields.categoria?.[0];
    const alcohol = fields.alcohol?.[0] === "true";

    const docRef = doc(db, "menus", id);
    const existingSnap = await getDoc(docRef);

    if (!existingSnap.exists()) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const update = {
      nombre,
      tipo,
      precio,
      precioConIVA,
      descuento,
    };

    if (tipo === "comida") {
      update.adicionales = adicionales;
      if (categoria) update.categoria = categoria;
    }

    if (tipo === "bebida") {
      update.alcohol = alcohol;
    }

    // Si hay nueva imagen
    if (files.imagen?.[0]) {
      const file = files.imagen[0];
      const existing = existingSnap.data();

      if (existing?.imagen) {
        await deleteFromCloudinary(existing.imagen);
      }

      const result = await uploadToCloudinary(file.filepath);
      update.imagen = result.secure_url;
    }

    await updateDoc(docRef, update);

    return NextResponse.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al editar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
