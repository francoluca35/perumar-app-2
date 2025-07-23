// /api/estadisticas/dinner/route.js
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "datos_clientes"));
    const data = snapshot.docs.map((doc) => doc.data());

    const stats = {
      porDia: {},
      porSemana: {},
      porMes: {},
    };

    data.forEach((item) => {
      const fecha = item.timestamp?.toDate?.() || new Date(item.timestamp);
      const total = parseFloat(item.total) || 0;

      if (isNaN(total)) return;

      // Día (formato YYYY-MM-DD)
      const dia = fecha.toISOString().split("T")[0];

      // Semana y año ISO
      const semana = getISOWeek(fecha);
      const año = fecha.getFullYear();

      // Mes
      const mes = fecha.getMonth() + 1;

      // Día
      stats.porDia[dia] = (stats.porDia[dia] || 0) + total;

      // Semana
      const keySemana = `${año}-W${semana}`;
      stats.porSemana[keySemana] = (stats.porSemana[keySemana] || 0) + total;

      // Mes
      const keyMes = `${año}-${mes.toString().padStart(2, "0")}`;
      stats.porMes[keyMes] = (stats.porMes[keyMes] || 0) + total;
    });

    const formatObjectToArray = (obj, sortDesc = true) =>
      Object.entries(obj)
        .map(([k, v]) => ({ _id: k, total: v }))
        .sort((a, b) =>
          sortDesc ? b._id.localeCompare(a._id) : a._id.localeCompare(b._id)
        );

    return new Response(
      JSON.stringify({
        porDia: formatObjectToArray(stats.porDia),
        porSemana: formatObjectToArray(stats.porSemana),
        porMes: formatObjectToArray(stats.porMes),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error en /estadisticas/dinner:", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}

// Utilidad para semana ISO
function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNo =
    Math.floor((target - firstThursday) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return weekNo;
}
