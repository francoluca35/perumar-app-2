import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IncomingForm } from "formidable";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convierte ReadableStream de Next.js en uno compatible con Node
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

// Subida a Cloudinary
async function uploadToCloudinary(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "comandas",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
}

// Eliminar imagen anterior
async function deleteFromCloudinary(imageUrl) {
  const parts = imageUrl.split("/");
  const publicIdWithExtension = parts[parts.length - 1];
  const publicId = `comandas/${publicIdWithExtension.split(".")[0]}`;
  await cloudinary.uploader.destroy(publicId);
}

// 👉 Método PUT
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
    const descuento = fields.descuento?.[0]
      ? parseFloat(fields.descuento?.[0])
      : 0;
    const adicionales = fields.adicionales?.[0]
      ? JSON.parse(fields.adicionales[0])
      : [];
    const categoria = fields.categoria?.[0];
    const alcohol = fields.alcohol?.[0] === "true";

    const client = await clientPromise;
    const db = client.db("comandas");

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

      // Buscar imagen anterior
      const existing = await db
        .collection("menus")
        .findOne({ _id: new ObjectId(id) });

      if (existing?.imagen) {
        await deleteFromCloudinary(existing.imagen);
      }

      const result = await uploadToCloudinary(file.filepath);
      update.imagen = result.secure_url;
    }

    await db
      .collection("menus")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al editar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
