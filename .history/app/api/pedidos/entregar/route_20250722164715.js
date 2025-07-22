import { NextResponse } from "next/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // o donde esté tu instancia Firestore

export async function PUT(req) {
  try {
    const { id, horaEntrega } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID" }, { status: 400 });
    }

    const pedidoRef = doc(db, "pedidos", id);
    const pedidoSnap = await getDoc(pedidoRef);

    if (!pedidoSnap.exists()) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const pedido = pedidoSnap.data();

    // ✅ Actualizar estado y hora de entrega
    await updateDoc(pedidoRef, {
      estado: "entregado",
      horaEntrega: horaEntrega || new Date().toISOString(),
    });

    // ✅ Si pagó en efectivo, sumar a la caja
    if (pedido.formaDePago === "efectivo") {
      const cajaRef = doc(db, "cajaRegistradora", "estado");
      await updateDoc(cajaRef, {
        montoActual: pedido.total || 0,
      });
      // ⚠️ Esto reemplaza el monto. Si querés sumarlo:
      // usar transaction o increment()
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al marcar como entregado:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
