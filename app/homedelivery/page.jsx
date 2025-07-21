"use client";

import React, { Suspense } from "react";
import RutaDelivery from "./components/RutaDelivery";

export default function HomeDeliveryPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="text-center text-white mt-10">
            Cargando pedidos...
          </div>
        }
      >
        <RutaDelivery />
      </Suspense>
    </div>
  );
}
