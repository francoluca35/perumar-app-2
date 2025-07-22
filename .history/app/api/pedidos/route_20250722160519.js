import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pedidosRef = collection(db, "pedidos");

    // Ordenar por timestamp descendente si existe
    const q = query(pedidosRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const pedido = await req.json();

    if (!pedido || !pedido.nombre || !pedido.total) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos" },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "pedidos"), {
      ...pedido,
      estado: pedido.estado || "en curso",
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Pedido guardado correctamente",
    });
  } catch (error) {
    console.error("🔥 Error en POST /api/pedidos:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}
