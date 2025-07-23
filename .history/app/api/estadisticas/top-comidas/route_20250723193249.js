import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "datos_clientes"));
    const data = snapshot.docs.map((doc) => doc.data());

    const conteo = {};

    data.forEach((item) => {
      if (!item.timestamp || !item.comida) return;

      const fecha =
        item.timestamp.seconds && item.timestamp.nanoseconds
          ? new Date(item.timestamp.seconds * 1000)
          : new Date(item.timestamp);

      const diaSemana = fecha.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab

      if (diaSemana >= 1 && diaSemana <= 5) {
        conteo[item.comida] = (conteo[item.comida] || 0) + 1;
      }
    });

    const topComidas = Object.entries(conteo)
      .map(([comida, cantidad]) => ({ _id: comida, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

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
