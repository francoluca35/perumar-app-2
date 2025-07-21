import { Suspense } from "react";
import UserDropdown from "../components/ui/UserDropdown";
import UsuariosList from "../components/UsuariosList";

export default function UsuariosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="flex justify-end ">
        <UserDropdown />
      </div>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Panel de Usuarios
        </h1>

        <Suspense
          fallback={<div className="text-white p-4">Cargando perfil...</div>}
        >
          <UsuariosList />
        </Suspense>
      </div>
    </div>
  );
}
