import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    const hoy = new Date();
    const fechas = [];

    for (let i = 0; i < limit; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - skip - i);
      fechas.push(
        new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
      );
    }

    const datos = [];

    for (const fecha of fechas) {
      const inicio = new Date(fecha);
      const fin = new Date(fecha);
      fin.setDate(fin.getDate() + 1);

      const ingresos = await db
        .collection("ingresosDiarios")
        .aggregate([
          { $match: { timestamp: { $gte: inicio, $lt: fin } } },
          { $group: { _id: null, total: { $sum: "$totalPedido" } } },
        ])
        .toArray();
      const ingresoTotal = ingresos[0]?.total || 0;

      const retiros = await db
        .collection("retiroEfectivo")
        .find({ timestamp: { $gte: inicio, $lt: fin } })
        .toArray();
      const retirosTotal = retiros.reduce((acc, r) => acc + r.montoRetirado, 0);

      const cierre = await db.collection("cierresCaja").findOne({
        timestamp: { $gte: inicio, $lt: fin },
      });

      datos.push({
        fecha: fecha.toISOString().split("T")[0],
        ingresoTotal,
        retirosTotal,
        neto: ingresoTotal - retirosTotal,
        cierreCaja: cierre?.saldoEnCaja ?? null,
        horaCierre: cierre?.horaCierre ?? null,
        retiros: retiros.map((r) => ({
          hora: new Date(r.timestamp).toLocaleTimeString("es-AR"),
          monto: r.montoRetirado,
          motivo: r.motivo,
        })),
      });
    }

    return NextResponse.json({ data: datos });
  } catch (error) {
    console.error("Error informe diario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const db = await connectToDatabase();

    const fecha = new Date(timestamp).toISOString().split("T")[0];

    await db.collection("ingresosDiarios").insertOne({
      ingresoTotal: parseFloat(totalPedido),
      timestamp: new Date(timestamp),
      fecha: fecha,
    });

    return NextResponse.json({ message: "Ingreso diario registrado" });
  } catch (err) {
    console.error("Error al guardar ingreso diario:", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
