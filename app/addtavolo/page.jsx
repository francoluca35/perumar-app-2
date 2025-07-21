import React, { Suspense } from "react";
import AddTavolo from "./components/AddTavolo";

function addtavolo() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="text-center text-white text-lg py-10 animate-pulse">
            Cargando Add table
          </div>
        }
      >
        <AddTavolo />
      </Suspense>
    </div>
  );
}

export default addtavolo;
