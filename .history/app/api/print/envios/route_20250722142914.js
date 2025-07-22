import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Enviar a la API local para imprimir
    const response = await fetch(
      "https://right-worthy-collie.ngrok-free.app/print-delivery",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const mensaje = await response.text();

    // 2. Guardar registro en Firebase
    const logRef = collection(db, "impresionesDelivery");
    await addDoc(logRef, {
      ...body,
      mensaje,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: mensaje });
  } catch (err) {
    console.error("Error al imprimir o guardar log:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel" },
      { status: 500 }
    );
  }
}
