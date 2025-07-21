import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { username } = await req.json();

  const client = await clientPromise;
  const db = client.db("comandas");

  const turno = await db
    .collection("turnos")
    .findOne({ username, online: true });
  return NextResponse.json({ online: !!turno });
}
