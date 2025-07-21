import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const comanda = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas2");

    await db.collection("comandas2").insertOne(comanda);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar comanda:", error);
    return NextResponse.json(
      { error: "Error al guardar comanda" },
      { status: 500 }
    );
  }
}
