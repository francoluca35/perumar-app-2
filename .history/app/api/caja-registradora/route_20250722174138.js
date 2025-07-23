import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { total } = await req.json();

    if (typeof total !== "number") {
      return NextResponse.json({ error: "Total inválido" }, { status: 400 });
    }

    const cajaRef = doc(db, "cajaRegistradora", "estado");
    const cajaSnap = await getDoc(cajaRef);

    if (cajaSnap.exists()) {
      await updateDoc(cajaRef, {
        montoActual: (cajaSnap.data().montoActual || 0) + total,
        fechaActualizacion: Timestamp.now(),
      });
    } else {
      await setDoc(cajaRef, {
        montoActual: total,
        fechaActualizacion: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error al sumar en caja:", err);
    return NextResponse.json(
      { error: "Error al sumar en caja" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cajaRef = doc(db, "cajaRegistradora", "estado");
    const cajaSnap = await getDoc(cajaRef);
    const caja = cajaSnap.data();

    return NextResponse.json({
      montoActual: caja?.montoActual || 0,
      fechaActualizacion: caja?.fechaActualizacion?.toDate() || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const { monto } = await req.json();
    if (monto == null) {
      return NextResponse.json({ error: "Falta el monto" }, { status: 400 });
    }

    const cajaRef = doc(db, "cajaRegistradora", "estado");
    const cajaSnap = await getDoc(cajaRef);
    const actual = cajaSnap.data()?.montoActual || 0;

    await setDoc(
      cajaRef,
      {
        montoActual: actual + parseFloat(monto),
        fechaActualizacion: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({ message: "Monto sumado correctamente" });
  } catch (err) {
    console.error("Error al sumar monto:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const { monto } = await req.json();

    if (typeof monto !== "number") {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const cajaRef = doc(db, "cajaRegistradora", "estado");

    await setDoc(
      cajaRef,
      {
        montoActual: monto,
        fechaActualizacion: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({ message: "Monto actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar monto:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
