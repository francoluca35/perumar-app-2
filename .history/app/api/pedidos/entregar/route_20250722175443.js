import { NextResponse } from "next/server";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

    // ✅ Marcar como entregado
    await updateDoc(pedidoRef, {
      estado: "entregado",
      horaEntrega: horaEntrega || new Date().toISOString(),
    });

    // ✅ Si pagó en efectivo, sumar el total a caja
    if (pedido.formaDePago === "efectivo") {
      const cajaRef = doc(db, "cajaRegistradora", "estado");
      const cajaSnap = await getDoc(cajaRef);

      const montoActual = cajaSnap.exists()
        ? cajaSnap.data().montoActual || 0
        : 0;
      const nuevoMonto = montoActual + (pedido.total || 0);

      await updateDoc(cajaRef, {
        montoActual: nuevoMonto,
        fechaActualizacion: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al marcar como entregado:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
