"use client";

import React, { Suspense } from "react";
import Table from "./components/table";

function Tavolo() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="text-center text-white text-lg py-10 animate-pulse">
            Cargando tablero de mesas...
          </div>
        }
      >
        <Table />
      </Suspense>
    </div>
  );
}

export default Tavolo;
