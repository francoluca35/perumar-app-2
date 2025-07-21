import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { IncomingForm } from "formidable";
import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary";

// ⛔️ Evitar bodyParser por defecto (necesario para FormData)
export const config = {
  api: {
    bodyParser: false,
  },
};

// 🔄 Convertir ReadableStream (Next.js) a Node.js
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

// 📤 Subir nueva imagen a Cloudinary
async function uploadToCloudinary(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "comandas2",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
}

// 🗑️ Borrar imagen anterior
async function deleteFromCloudinary(imageUrl) {
  if (!imageUrl) return;
  const parts = imageUrl.split("/");
  const filename = parts.pop().split(".")[0];
  const publicId = `comandas2/${filename}`;
  await cloudinary.uploader.destroy(publicId);
}

// ✏️ PUT - Editar producto
export async function PUT(req) {
  try {
    const nodeReq = await streamToNodeReadable(req.body);
    nodeReq.headers = Object.fromEntries(req.headers.entries());
    nodeReq.method = req.method;

    const form = new IncomingForm({ keepExtensions: true });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(nodeReq, (err, f, fi) => {
        if (err) reject(err);
        else resolve({ fields: f, files: fi });
      });
    });

    // Extraer datos
    const id = fields.id?.[0];
    const nombre = fields.nombre?.[0];
    const tipo = fields.tipo?.[0];
    const precio = parseFloat(fields.precio?.[0]);
    const precioConIVA = parseFloat(fields.precioConIVA?.[0]);
    const descuento = parseFloat(fields.descuento?.[0]) || 0;
    const adicionales = fields.adicionales?.[0]
      ? JSON.parse(fields.adicionales[0])
      : [];
    const categoria = fields.categoria?.[0];
    const alcohol = fields.alcohol?.[0] === "true";

    if (!id || !nombre || !tipo || isNaN(precio)) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes o inválidos" },
        { status: 400 }
      );
    }

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
      precioConIVA: isNaN(precioConIVA) ? 0 : precioConIVA,
      descuento,
    };

    if (tipo === "comida") {
      update.adicionales = adicionales;
      if (categoria) update.categoria = categoria;
    }

    if (tipo === "bebida") {
      update.alcohol = alcohol;
    }

    // Nueva imagen
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
    console.error("❌ Error en editar producto:", error);
    return NextResponse.json(
      { message: "Error del servidor", details: error.message },
      { status: 500 }
    );
  }
}
