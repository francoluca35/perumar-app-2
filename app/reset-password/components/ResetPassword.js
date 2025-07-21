"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return Swal.fire("Error", data.error || "Algo salió mal", "error");
      }

      await Swal.fire(
        "¡Éxito!",
        "Contraseña actualizada correctamente",
        "success"
      );
      router.push("/login");
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "No se pudo procesar la solicitud", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur p-8 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Nueva Contraseña 🔑
        </h2>

        {!token ? (
          <p className="text-red-500 text-center">Token inválido o faltante</p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
