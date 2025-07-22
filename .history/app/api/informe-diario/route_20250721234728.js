import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "5");

    const hoy = new Date();
    const datos = [];

    for (let i = 0; i < limit; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (page - 1) * limit - i);
      fecha.setHours(0, 0, 0, 0);

      const inicio = Timestamp.fromDate(fecha);
      const fin = Timestamp.fromDate(new Date(fecha.getTime() + 86400000));

      const ingresosSnap = await getDocs(
        query(
          collection(db, "ingresosDiarios"),
          where("timestamp", ">=", inicio),
          where("timestamp", "<", fin)
        )
      );

      let ingresoTotal = 0;
      ingresosSnap.forEach((doc) => {
        ingresoTotal += parseFloat(doc.data().ingresoTotal);
      });

      const retirosSnap = await getDocs(
        query(
          collection(db, "retiroEfectivo"),
          where("timestamp", ">=", inicio),
          where("timestamp", "<", fin)
        )
      );

      let retirosTotal = 0;
      const retiros = [];
      retirosSnap.forEach((doc) => {
        const data = doc.data();
        retirosTotal += parseFloat(data.montoRetirado);
        retiros.push({
          hora: data.timestamp.toDate().toLocaleTimeString("es-AR"),
          monto: data.montoRetirado,
          motivo: data.motivo,
        });
      });

      datos.push({
        fecha: fecha.toISOString().split("T")[0],
        ingresoTotal,
        retirosTotal,
        neto: ingresoTotal - retirosTotal,
        retiros,
        cierreCaja: null, // Puedes implementar colección "cierresCaja" si la tenés
        horaCierre: null,
      });
    }

    return NextResponse.json({ data: datos });
  } catch (err) {
    console.error("Error informe diario Firebase:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    await addDoc(collection(db, "ingresosDiarios"), {
      ingresoTotal: parseFloat(totalPedido),
      timestamp: Timestamp.fromDate(new Date(timestamp)),
      fecha: new Date(timestamp).toISOString().split("T")[0],
    });

    return NextResponse.json({
      message: "Ingreso diario registrado (Firebase)",
    });
  } catch (err) {
    console.error("Error al guardar ingreso diario:", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
