import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    // Picos de clientes por día y hora
    const horarios = await db
      .collection("datos_clientes")
      .aggregate([
        {
          $project: {
            diaSemana: { $dayOfWeek: "$timestamp" }, // 1 (Dom) - 7 (Sáb)
            hora: { $hour: "$timestamp" },
          },
        },
        {
          $group: {
            _id: { dia: "$diaSemana", hora: "$hora" },
            cantidad: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.dia": 1, "_id.hora": 1 },
        },
      ])
      .toArray();

    // Comidas más consumidas de lunes a viernes
    const topComidas = await db
      .collection("datos_clientes")
      .aggregate([
        {
          $project: {
            comida: 1,
            diaSemana: { $dayOfWeek: "$timestamp" },
          },
        },
        {
          $match: {
            diaSemana: { $gte: 2, $lte: 6 }, // Lunes a viernes
          },
        },
        {
          $group: {
            _id: "$comida",
            cantidad: { $sum: 1 },
          },
        },
        {
          $sort: { cantidad: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray();

    return new Response(JSON.stringify({ horarios, topComidas }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en estadisticas:", error);
    return new Response(
      JSON.stringify({ error: "Error generando estadísticas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
