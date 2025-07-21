"use client";
import React, { useEffect, useState } from "react";

function StadisticTradeDiaHora() {
  const [data, setData] = useState(null);
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  useEffect(() => {
    fetch("/api/estadisticas/dia-hora")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data)
    return <p className="text-center text-gray-400 mt-6">Cargando datos...</p>;

  const matriz = dias.map((diaNombre, i) => {
    const diaData = data.find((d) => d._id === i + 1);
    const horas = Array(24).fill(0);
    if (diaData) {
      diaData.horas.forEach((h) => {
        horas[h.hora] = h.cantidad;
      });
    }
    return { dia: diaNombre, horas };
  });

  const maxCount = Math.max(...matriz.flatMap((d) => d.horas));
  const getCellColor = (val) =>
    val
      ? `rgba(100,180,250,${Math.min(val / maxCount, 1) * 0.6 + 0.2})`
      : "#1f1f1f";

  return (
    <div className="bg-[#181818] p-6 mt-4 rounded-xl shadow-lg overflow-x-auto">
      <h2 className="text-center text-lg font-semibold text-gray-200 mb-4">
        Clientes por día y hora
      </h2>
      <table className="min-w-[800px] w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr>
            <th className="bg-[#2a2a2a] text-left text-gray-300 px-4 py-2 rounded-l-lg sticky left-0 z-10">
              Día / Hora
            </th>
            {[...Array(24).keys()].map((h) => (
              <th key={h} className="bg-[#2a2a2a] text-gray-400 px-2 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.map(({ dia, horas }) => (
            <tr key={dia}>
              <td className="bg-[#222] text-gray-200 font-medium px-4 py-2 sticky left-0 rounded-l-lg">
                {dia}
              </td>
              {horas.map((cant, i) => (
                <td
                  key={i}
                  className="text-center px-2 py-1 rounded-md transition"
                  style={{
                    backgroundColor: getCellColor(cant),
                    color: cant ? "#111" : "#666",
                    fontWeight: cant ? 600 : 400,
                  }}
                  title={`${cant || 0} cliente${cant === 1 ? "" : "s"}`}
                >
                  {cant || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StadisticTradeDiaHora;
