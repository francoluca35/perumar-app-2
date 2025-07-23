// app/api/cierre-caja/route.js
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const hoy = new Date();
    const fecha = hoy.toISOString().split("T")[0];
    const inicio = new Date(fecha + "T00:00:00");
    const fin = new Date(inicio.getTime() + 86400000);

    const ingresosSnap = await getDocs(
      query(
        collection(db, "ingresosDiarios"),
        where("timestamp", ">=", Timestamp.fromDate(inicio)),
        where("timestamp", "<", Timestamp.fromDate(fin))
      )
    );

    const retirosSnap = await getDocs(
      query(
        collection(db, "retiroEfectivo"),
        where("timestamp", ">=", Timestamp.fromDate(inicio)),
        where("timestamp", "<", Timestamp.fromDate(fin))
      )
    );

    let totalIngresos = 0;
    ingresosSnap.forEach((doc) => {
      totalIngresos += parseFloat(doc.data().ingresoTotal || 0);
    });

    let totalRetiros = 0;
    retirosSnap.forEach((doc) => {
      totalRetiros += parseFloat(doc.data().montoRetirado || 0);
    });

    const neto = totalIngresos - totalRetiros;

    const cajaRef = doc(db, "cajaRegistradora", "estado");
    const cajaSnap = await getDoc(cajaRef);
    const saldoEnCaja = cajaSnap.data()?.montoActual || 0;

    await addDoc(collection(db, "cierresCaja"), {
      fechaCierre: fecha,
      horaCierre: hoy.toLocaleTimeString("es-AR"),
      totalIngresos,
      totalRetiros,
      neto,
      saldoEnCaja,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({
      message: "Cierre registrado correctamente",
      cierre: { totalIngresos, totalRetiros, neto, saldoEnCaja },
    });
  } catch (err) {
    console.error("Error al realizar cierre:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
