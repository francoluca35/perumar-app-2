"use client";

import React, { Suspense } from "react";
import Pedidos from "./components/pedidos";

export default function Delivery() {
  return (
    <div>
      <Suspense
        fallback={<p className="text-white text-center">Cargando pedido...</p>}
      >
        <Pedidos />
      </Suspense>
    </div>
  );
}
