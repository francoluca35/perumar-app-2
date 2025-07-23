import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "datos_clientes"));
    const data = snapshot.docs.map((doc) => doc.data());

    const horariosMap = {};
    const comidasMap = {};

    data.forEach((item) => {
      if (!item.timestamp) return;

      const fecha =
        item.timestamp.seconds && item.timestamp.nanoseconds
          ? new Date(item.timestamp.seconds * 1000)
          : new Date(item.timestamp); // fallback si es Date normal

      const dia = fecha.getDay(); // 0 (Dom) - 6 (Sáb)
      const hora = fecha.getHours();

      const key = `${dia}-${hora}`;
      horariosMap[key] = (horariosMap[key] || 0) + 1;

      if (dia >= 1 && dia <= 5 && item.comida) {
        comidasMap[item.comida] = (comidasMap[item.comida] || 0) + 1;
      }
    });

    const horarios = Object.entries(horariosMap)
      .map(([key, cantidad]) => {
        const [dia, hora] = key.split("-").map(Number);
        return { _id: { dia, hora }, cantidad };
      })
      .sort((a, b) =>
        a._id.dia === b._id.dia
          ? a._id.hora - b._id.hora
          : a._id.dia - b._id.dia
      );

    const topComidas = Object.entries(comidasMap)
      .map(([comida, cantidad]) => ({ _id: comida, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    return new Response(JSON.stringify({ horarios, topComidas }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en estadísticas:", error);
    return new Response(
      JSON.stringify({ error: "Error generando estadísticas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
