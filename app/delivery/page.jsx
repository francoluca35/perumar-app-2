"use client";

import React, { Suspense } from "react";
import Maps from "./components/maps";

function Delivery() {
  return (
    <div>
      <Suspense
        fallback={<p className="text-white text-center">Cargando destino...</p>}
      >
        <Maps />
      </Suspense>
    </div>
  );
}

export default Delivery;
