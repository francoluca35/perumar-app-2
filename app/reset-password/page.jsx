import { Suspense } from "react";
import ResetPassword from "./components/ResetPassword";

export default function Page() {
  return (
    <Suspense
      fallback={<p className="text-white text-center py-10">Cargando...</p>}
    >
      <ResetPassword />
    </Suspense>
  );
}
