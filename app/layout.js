// app/layout.js
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NextUIProvider } from "@nextui-org/react";
import Script from "next/script";

export const metadata = {
  title: "Comandas",
  description: "Sistema de pedidos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Google Maps Script */}
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_KEY}`}
          async
          defer
        ></script>
      </head>
      <body>
        <NextUIProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
