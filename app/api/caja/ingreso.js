import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Cambia si tu helper es distinto

export async function POST(req) {
  const body = await req.json();
  const { monto, fecha } = body; // fecha = "9/7/2025" o similar

  const client = await clientPromise;
  const db = client.db("comandas");

  // Sumar a ingresosDiarios
  await db.collection("ingresosDiarios").updateOne(
    { fecha }, // Un registro por día
    { $inc: { efectivo: monto } },
    { upsert: true }
  );

  // Sumar a cajaRegistradora (único documento)
  await db.collection("cajaRegistradora").updateOne(
    {},
    {
      $inc: { montoActual: monto },
      $set: { fechaActualizacion: new Date() },
    }
  );

  return NextResponse.json({ success: true });
}
