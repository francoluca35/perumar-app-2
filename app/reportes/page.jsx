import React, { Suspense } from "react";
import ReportePorFecha from "../components/GenerarReporte";
import UserDropdown from "../components/ui/UserDropdown";
import StadisticTrade from "../components/StadisticTrade";

function Reportes() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white flex flex-col">
      <div className="flex justify-end p-4">
        <UserDropdown />
      </div>
      <Suspense fallback={<p className="text-gray-400">Cargando menú...</p>}>
        <ReportePorFecha />

        <StadisticTrade />
      </Suspense>
    </main>
  );
}

export default Reportes;
