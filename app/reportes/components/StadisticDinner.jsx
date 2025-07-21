"use client";
import React, { useEffect, useState } from "react";

function StadisticDinner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/estadisticas/dinner")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data)
    return (
      <p className="text-center text-gray-400 mt-6">Cargando estadísticas...</p>
    );

  const formatCurrency = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  const totalDia = data.porDia?.[0]?.total || 0;
  const totalSemana = data.porSemana?.[0]?.total || 0;
  const totalMes = data.porMes?.[0]?.total || 0;

  return (
    <div className="bg-[#181818] p-6 rounded-xl shadow-lg w-full space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-sm text-blue-800 font-medium">Hoy</h3>
          <p className="text-xl font-bold text-blue-900">
            {formatCurrency(totalDia)}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <h3 className="text-sm text-green-800 font-medium">Esta Semana</h3>
          <p className="text-xl font-bold text-green-900">
            {formatCurrency(totalSemana)}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <h3 className="text-sm text-yellow-800 font-medium">Este Mes</h3>
          <p className="text-xl font-bold text-yellow-900">
            {formatCurrency(totalMes)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StadisticDinner;
