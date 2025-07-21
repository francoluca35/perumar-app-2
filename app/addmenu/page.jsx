"use client";

import React, { Suspense } from "react";
import AgregarMenu from "./components/AgregarMenu";

export default function AddMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="text-white p-10 text-center">Cargando menú...</div>
      }
    >
      <AgregarMenu />
    </Suspense>
  );
}
