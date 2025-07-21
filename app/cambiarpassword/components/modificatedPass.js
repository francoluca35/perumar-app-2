"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ModificatedPass() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username) {
      setLoading(false);
      return Swal.fire("Error", "Usuario no logueado", "error");
    }

    const res = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ...form }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      return Swal.fire("Error", data.error || "Algo falló", "error");
    }

    await Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur p-8 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Cambiar Contraseña 🔐
        </h2>

        <label className="text-white text-sm mb-1 block">Usuario</label>
        <input
          type="text"
          value={username}
          disabled
          className="w-full px-4 py-2 rounded bg-gray-800 text-gray-400 mb-4 border border-gray-600"
        />

        <input
          type="password"
          name="oldPassword"
          placeholder="Contraseña actual"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="password"
          name="newPassword"
          placeholder="Nueva contraseña"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
        >
          {loading ? "Guardando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </div>
  );
}
