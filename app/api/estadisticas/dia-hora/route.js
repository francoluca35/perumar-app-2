import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const tablaClientesDiaHora = await db
      .collection("datos_clientes")
      .aggregate([
        // Ajusta timestamp restando 3 horas (3 * 60 * 60 * 1000 ms)
        {
          $addFields: {
            timestamp_arg: { $subtract: ["$timestamp", 1000 * 60 * 60 * 3] },
          },
        },
        {
          $project: {
            diaSemana: { $dayOfWeek: "$timestamp_arg" }, // domingo=1 ... sábado=7
            hora: { $hour: "$timestamp_arg" },
          },
        },
        {
          $group: {
            _id: { dia: "$diaSemana", hora: "$hora" },
            cantidad: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.dia",
            horas: {
              $push: {
                hora: "$_id.hora",
                cantidad: "$cantidad",
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    return new Response(JSON.stringify(tablaClientesDiaHora), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en tabla clientes día/hora:", error);
    return new Response(
      JSON.stringify({ error: "Error generando tabla clientes día/hora" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
