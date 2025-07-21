"use client";
import React, { useEffect, useState } from "react";

function TopComidas() {
  const [comidas, setComidas] = useState(null);

  useEffect(() => {
    fetch("/api/estadisticas/top-comidas")
      .then((res) => res.json())
      .then(setComidas);
  }, []);

  if (!comidas)
    return (
      <p className="text-center text-gray-400 mt-6">Cargando top comidas...</p>
    );

  return (
    <div className="bg-[#181818] p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        🍽️ Top 10 comidas (Lunes a Viernes)
      </h2>
      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr>
            <th className="bg-[#2a2a2a] text-left text-gray-300 px-4 py-2 rounded-l-lg">
              Comida
            </th>
            <th className="bg-[#2a2a2a] text-right text-gray-300 px-4 py-2 rounded-r-lg">
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody>
          {comidas.map(({ _id, cantidad }, index) => {
            const bgColor = `rgba(100, 180, 250, ${
              0.15 + (0.5 * (10 - index)) / 10
            })`;
            return (
              <tr key={_id}>
                <td className="bg-[#222] text-gray-100 font-medium px-4 py-2 rounded-l-lg">
                  {_id}
                </td>
                <td
                  className="text-right font-semibold px-4 py-2 rounded-r-lg"
                  style={{ backgroundColor: bgColor, color: "#111" }}
                >
                  {cantidad}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TopComidas;
