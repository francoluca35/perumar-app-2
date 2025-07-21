import clientPromise from "@/lib/mongodb";
import ExcelJS from "exceljs";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const { searchParams } = new URL(req.url);
    const desde = new Date(searchParams.get("desde"));
    const hasta = new Date(searchParams.get("hasta"));

    // Incluir todo el día 'hasta'
    hasta.setHours(23, 59, 59, 999);

    const datos = await db
      .collection("datos_clientes")
      .find({
        timestamp: { $gte: desde, $lte: hasta },
      })
      .toArray();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clientes");

    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Cliente", key: "cliente", width: 20 },
      { header: "Comida", key: "comida", width: 30 },
      { header: "Bebida", key: "bebida", width: 20 },
      { header: "Total", key: "total", width: 10 },
      { header: "Método de Pago", key: "metodoPago", width: 15 },
    ];

    datos.forEach((d) => {
      worksheet.addRow({
        fecha: d.fecha,
        cliente: d.cliente,
        comida: d.comida,
        bebida: d.bebida,
        total: d.total,
        metodoPago: d.metodoPago,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": "attachment; filename=clientes_rango.xlsx",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generando Excel:", error);
    return new Response(JSON.stringify({ error: "Error generando reporte" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
