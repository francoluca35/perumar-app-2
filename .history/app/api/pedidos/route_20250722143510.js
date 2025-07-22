import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  setDoc,
} from "firebase/firestore";

export async function POST(req) {
  try {
    const pedido = await req.json();

    const nuevoPedido = {
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: pedido.fecha || new Date().toISOString(),
      timestamp: serverTimestamp(),
    };

    // 👉 Guardar en colección pedidos
    const pedidosRef = collection(db, "pedidos");
    const docRef = await addDoc(pedidosRef, nuevoPedido);

    // 👉 Si es efectivo, sumar a ingresos y caja
    if (pedido.formaDePago === "efectivo") {
      const ingresosRef = collection(db, "ingresosDiarios");
      await addDoc(ingresosRef, {
        totalPedido: pedido.total,
        timestamp: new Date(),
      });

      const cajaRef = doc(db, "cajaRegistradora", "estado");
      await setDoc(
        cajaRef,
        {
          montoActual: increment(pedido.total),
          fechaActualizacion: new Date(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pedido guardado correctamente",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "pedidos"));

    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(pedidos); // ✅ devolver un array directamente
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
