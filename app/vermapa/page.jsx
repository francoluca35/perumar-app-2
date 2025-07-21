import { Suspense } from "react";
import VerMapa from "./components/VerMapa";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Cargando mapa...</div>}>
      <VerMapa />
    </Suspense>
  );
}
