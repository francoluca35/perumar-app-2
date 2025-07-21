"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import UserDropdown from "@/app/components/ui/UserDropdown";

export default function ModificatedProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    newUsername: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    if (user?.username) {
      setCurrentUsername(user.username);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUsername) {
      return Swal.fire("Error", "Usuario no logueado", "error");
    }

    setLoading(true);

    const payload = {
      currentUsername,
      ...(form.newUsername.trim() && { newUsername: form.newUsername.trim() }),
      ...(form.email.trim() && { email: form.email.trim() }),
    };

    if (!payload.newUsername && !payload.email) {
      setLoading(false);
      return Swal.fire("Aviso", "Debés completar al menos un campo", "info");
    }

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return Swal.fire("Error", data.error || "Algo falló", "error");
      }

      await Swal.fire(
        "Éxito",
        "Perfil actualizado. Volverás al login",
        "success"
      );
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setLoading(false);
      Swal.fire("Error", "Error del servidor", "error");
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur p-8 rounded-xl w-full max-w-md shadow-xl"
        >
          <h2 className="text-white text-2xl font-bold mb-6 text-center">
            Editar Perfil 📝
          </h2>

          <label className="text-white text-sm mb-1 block">
            Usuario actual
          </label>
          <input
            type="text"
            value={currentUsername}
            disabled
            className="w-full px-4 py-2 rounded bg-gray-800 text-gray-400 mb-4 border border-gray-600"
          />

          <label className="text-white text-sm mb-1 block">Nuevo usuario</label>
          <input
            type="text"
            name="newUsername"
            placeholder="Nuevo usuario"
            value={form.newUsername}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          />

          <label className="text-white text-sm mb-1 block">Nuevo correo</label>
          <input
            type="email"
            name="email"
            placeholder="Nuevo correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
          >
            {loading ? "Guardando..." : "Actualizar Perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}
