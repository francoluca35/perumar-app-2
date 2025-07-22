import { firestore } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const { id, horaEntrega } = await req.json();

    if (!id || !horaEntrega) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const pedidoRef = doc(firestore, "pedidos", id);
    const pedidoSnap = await getDoc(pedidoRef);

    if (!pedidoSnap.exists()) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const pedido = pedidoSnap.data();

    // Marcar como entregado
    await updateDoc(pedidoRef, {
      estado: "entregado",
      horaEntrega,
    });

    // Si fue pago en efectivo, sumar a la caja
    if (pedido.formaDePago === "efectivo") {
      const cajaRef = doc(firestore, "caja", "actual");
      await updateDoc(cajaRef, {
        montoActual: pedido.total + (pedido.totalMP || 0), // incluye extra si existe
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al marcar como entregado:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
