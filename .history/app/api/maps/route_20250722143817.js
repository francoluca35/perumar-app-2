import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Solo pedidos con timestamp definido y ordenados del más reciente al más antiguo
    const pedidosRef = collection(db, "pedidos");
    const pedidosQuery = query(
      pedidosRef,
      where("timestamp", "!=", null), // ✅ solo válidos
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(pedidosQuery);

    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    );
  }
}
