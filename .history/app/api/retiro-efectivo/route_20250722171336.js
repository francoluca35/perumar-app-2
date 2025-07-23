// app/api/retiro-efectivo/route.js
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { montoRetirado, motivo } = await req.json();

    if (!montoRetirado || montoRetirado <= 0)
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

    if (!motivo || motivo.trim().length < 3)
      return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });

    const cajaRef = doc(db, "cajaRegistradora", "estado");
    const cajaSnap = await getDoc(cajaRef);
    const caja = cajaSnap.data();

    if (!caja)
      return NextResponse.json(
        { error: "Caja no inicializada" },
        { status: 400 }
      );

    const nuevoMonto = caja.montoActual - montoRetirado;
    if (nuevoMonto < 0)
      return NextResponse.json(
        { error: "Fondos insuficientes" },
        { status: 400 }
      );

    await addDoc(collection(db, "retiroEfectivo"), {
      montoRetirado,
      motivo,
      antiguoMonto: caja.montoActual,
      montoActualizado: nuevoMonto,
      timestamp: Timestamp.now(),
    });

    await updateDoc(cajaRef, {
      montoActual: nuevoMonto,
      fechaActualizacion: Timestamp.now(),
    });

    return NextResponse.json({ message: "Retiro registrado" });
  } catch (err) {
    console.error("Error al retirar:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
