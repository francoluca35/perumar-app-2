"use client";

import React, { Suspense } from "react";
import ModificatedPass from "./components/modificatedPass";

export default function CambiarPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-white text-center">Cargando formulario...</div>
      }
    >
      <ModificatedPass />
    </Suspense>
  );
}
