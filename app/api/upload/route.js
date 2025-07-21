// app/api/upload/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file)
    return NextResponse.json({ error: "No se envió imagen" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), "public", file.name);
  await writeFile(filePath, buffer); // guarda temporalmente

  try {
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      folder: "comandas",
    });

    return NextResponse.json({ url: uploadRes.secure_url }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
