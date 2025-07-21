import React from "react";
import StadisticTradeDiaHora from "../reportes/components/StadisticTradeDiaHora";
import TopComidas from "../reportes/components/TopComidas";
import StadisticDinner from "../reportes/components/StadisticDinner";

function StadisticTrade() {
  return (
    <div className="space-y-6">
      <StadisticTradeDiaHora />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <TopComidas />
        <StadisticDinner />
      </div>
    </div>
  );
}

export default StadisticTrade;
