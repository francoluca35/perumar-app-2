import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const pedidos = await db
      .collection("pedidos")
      .find({ timestamp: { $exists: true } }) // ✅ solo pedidos válidos
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    );
  }
}
