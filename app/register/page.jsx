"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validarRegistro } from "@/utils/validacionesRegistro";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    nombreCompleto: "",
    rol: "delivery",
  });
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");
  const [errores, setErrores] = useState({});
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrores({});

    const validacion = validarRegistro({
      username: form.username,
      password: form.password,
      foto,
    });

    if (Object.keys(validacion).length > 0) {
      setErrores(validacion);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (foto) formData.append("foto", foto);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error en el registro");
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-black to-blue-950">
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-md p-8 rounded-xl shadow-2xl">
        <div className="transition-all duration-500 hover:scale-[1.01]">
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <Image
              src="/Assets/LoginRegister/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>

          <h2 className="text-white text-2xl font-semibold text-center mb-4">
            Crear Cuenta.
          </h2>

          {/* HONEYPOT oculto para evitar autocompletado */}
          <div style={{ display: "none" }}>
            <input type="text" name="fake-user" autoComplete="username" />
            <input
              type="password"
              name="fake-pass"
              autoComplete="current-password"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            <input
              type="text"
              name="nombreCompleto"
              placeholder="Nombre Completo"
              onChange={handleChange}
              autoComplete="off"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
            />

            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              onChange={handleChange}
              autoComplete="new-username"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
            />
            {errores.username && (
              <p className="text-red-400 text-sm">{errores.username}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              onChange={handleChange}
              autoComplete="new-email"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
            />
            {errores.password && (
              <p className="text-red-400 text-sm">{errores.password}</p> // ✅
            )}

            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
            >
              <option value="admin">Administrador</option>
              <option value="mesera">Mesera</option>
              <option value="delivery">Repartidor</option>
            </select>

            <label className="block w-full text-center cursor-pointer bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all">
              Subir foto
              <input
                type="file"
                name="foto"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="hidden"
              />
            </label>
            {errores.foto && (
              <p className="text-red-400 text-sm">{errores.foto}</p> // ✅
            )}

            {preview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-24 h-24 rounded-full object-cover border-2 border-white shadow"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-md font-semibold hover:bg-orange-600 transition-all duration-300"
            >
              Registrarse
            </button>
          </form>

          <p className="text-gray-300 text-center text-sm mt-6">
            ¿Ya tenés cuenta?{" "}
            <a
              href="/login"
              className="text-orange-400 font-semibold hover:underline"
            >
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
