import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "datos_clientes"));
    const data = snapshot.docs.map((doc) => doc.data());

    const diasMap = {};

    data.forEach((item) => {
      if (!item.timestamp) return;

      const fecha =
        item.timestamp.seconds && item.timestamp.nanoseconds
          ? new Date(item.timestamp.seconds * 1000)
          : new Date(item.timestamp);

      // Ajustar UTC-3
      const fechaLocal = new Date(fecha.getTime() - 3 * 60 * 60 * 1000);

      const dia = fechaLocal.getDay(); // 0=Dom, 1=Lun... 6=Sab
      const hora = fechaLocal.getHours();

      if (!diasMap[dia]) diasMap[dia] = {};
      diasMap[dia][hora] = (diasMap[dia][hora] || 0) + 1;
    });

    const resultado = Object.entries(diasMap)
      .map(([diaStr, horasObj]) => {
        const dia = parseInt(diaStr);
        const horas = Object.entries(horasObj).map(([horaStr, cantidad]) => ({
          hora: parseInt(horaStr),
          cantidad,
        }));
        return { _id: dia, horas };
      })
      .sort((a, b) => a._id - b._id); // Ordenar por día

    return new Response(JSON.stringify(resultado), {
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
