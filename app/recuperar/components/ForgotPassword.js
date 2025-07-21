"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (value) => {
    setCaptcha(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captcha) {
      return Swal.fire(
        "Atención",
        "Por favor verifica el reCAPTCHA",
        "warning"
      );
    }

    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, captcha }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      return Swal.fire("Error", data.error || "Algo salió mal", "error");
    }

    Swal.fire(
      "Revisa tu correo",
      "Te hemos enviado el enlace de recuperación",
      "success"
    );
    setEmail("");
    setCaptcha(null);
  };

  if (!RECAPTCHA_KEY) {
    console.warn("⚠️ Falta la variable NEXT_PUBLIC_RECAPTCHA_SITE_KEY en .env");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur p-8 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Recuperar Contraseña 🔒
        </h2>

        <input
          type="email"
          placeholder="Tu correo registrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-orange-400"
          required
        />

        <ReCAPTCHA sitekey={RECAPTCHA_KEY} onChange={handleCaptchaChange} />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>
    </div>
  );
}
