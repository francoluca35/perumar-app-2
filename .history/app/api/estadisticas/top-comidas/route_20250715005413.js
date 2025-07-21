import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

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
            diaSemana: { $gte: 2, $lte: 6 }, // Lunes a Viernes
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

    return new Response(JSON.stringify(topComidas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en top comidas:", error);
    return new Response(
      JSON.stringify({ error: "Error generando top comidas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
