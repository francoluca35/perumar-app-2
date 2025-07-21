import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(req) {
  try {
    const { email, captcha } = await req.json();

    if (!email || !captcha) {
      return NextResponse.json(
        { error: "El correo y el captcha son obligatorios" },
        { status: 400 }
      );
    }

    // ✅ Validación reCAPTCHA con Google
    const captchaVerify = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${captcha}`,
      }
    );
    const captchaResult = await captchaVerify.json();

    if (!captchaResult.success) {
      return NextResponse.json(
        { error: "Falló la verificación de reCAPTCHA" },
        { status: 400 }
      );
    }

    // 📌 Buscar usuario por email
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client = await clientPromise;
    const db = client.db("comandas");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró un usuario con ese correo" },
        { status: 404 }
      );
    }

    // 🔑 Generar token y link
    const token = sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "30m",
    });

    const resetLink = `${BASE_URL}/reset-password?token=${token}`;
    console.log("🔗 Enlace generado:", resetLink);

    // 📤 Enviar correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Soporte <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Recupera tu contraseña",
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p><a href="${resetLink}" target="_blank">Haz clic aquí para cambiarla</a></p>
        <p>Este enlace expirará en 30 minutos.</p>
      `,
    });

    console.log("📧 Email enviado correctamente a:", email);

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un correo con instrucciones.",
    });
  } catch (error) {
    console.error("❌ Error interno en forgot-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
