import { NextResponse } from "next/server";
import clientPromise from "@/lib/firebaseuser";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("comandas2");
  const productos = await db.collection("menus").find().toArray();
  return NextResponse.json(productos);
}
