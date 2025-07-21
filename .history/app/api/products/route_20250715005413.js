import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("comandas");
  const productos = await db.collection("menus").find().toArray();
  return NextResponse.json(productos);
}
