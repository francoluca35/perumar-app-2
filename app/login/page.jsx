"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Usuario inexistente") {
          setError("⚠️ Usuario no existe.");
        } else if (data.error === "Contraseña incorrecta") {
          setError("⚠️ Contraseña incorrecta.");
        } else {
          setError("⚠️ Error al iniciar sesión.");
        }
        return;
      }

      // Guardamos el usuario en el contexto
      login(data.user);

      // Seteamos la bandera de mostrar la caja al iniciar
      sessionStorage.setItem("mostrarCaja", "true");

      // Redirigimos según el rol
      const rol = data.user?.rol?.trim().toLowerCase();

      if (rol === "admin") {
        router.push("/screenhome");
      } else if (rol === "delivery") {
        router.push("/homedelivery");
      } else if (rol === "mesera") {
        router.push("/screenhome");
      } else {
        setError("⚠️ Rol no autorizado.");
      }
    } catch (err) {
      setError("⚠️ Error de conexión con el servidor.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-black to-blue-950">
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-md p-8 rounded-xl shadow-2xl">
        <div className="transition-all duration-500 hover:scale-[1.01]">
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <Image
              src="/Assets/logo-definitivo.png"
              alt="Logo"
              width={90}
              height={64}
              className="rounded-full object-cover"
            />
          </div>

          <h2 className="text-white text-2xl font-semibold text-center mb-4">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
            />

            {error && (
              <p className="text-red-400 text-sm text-center font-medium bg-red-900/20 px-3 py-2 rounded-lg animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-md font-semibold hover:bg-orange-600 transition-all duration-300"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm mt-3">
            {" "}
            ¿Olvidaste tu contraseña? <br />
            <a
              href="/recuperar"
              className="text-cyan-400 font-bold hover:underline hover:text-cyan-300 transition"
            >
              Haz clic aquí para recuperarla
            </a>
          </p>
          <p className="text-gray-300 text-center text-sm mt-6">
            ¿No tenés cuenta?{" "}
            <a
              href="/register"
              className="text-orange-400 font-semibold hover:underline"
            >
              Registrarse
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
