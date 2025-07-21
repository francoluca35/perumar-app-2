"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  LogOut,
  UserCog,
  Lock,
  User,
  ChartColumn,
  PersonStanding,
} from "lucide-react";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const triggerRef = useRef(null);
  const pathname = usePathname();

  const getInitials = (name) => {
    if (!name) return "CH";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(user?.nombreCompleto);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (!user) return null;

  return (
    <div className="relative z-50">
      {/* Trigger: imagen de usuario */}
      <div
        ref={triggerRef}
        className="cursor-pointer"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(!open)}
      >
        {user?.imagen ? (
          <Image
            src={user.imagen}
            alt="Foto de perfil"
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-orange-400 transition">
            {initials}
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        onMouseLeave={() => setOpen(false)}
        className={`fixed top-0 right-0 h-full w-64 transform ${
          open ? "translate-x-0" : "translate-x-full"
        } bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white shadow-2xl transition-transform duration-300 ease-in-out p-6 z-50 rounded-l-xl flex flex-col`}
      >
        <div className="flex items-center gap-3 text-xl font-semibold mb-6 border-b border-white/20 pb-4">
          <Image
            src={user.imagen}
            alt="Foto de perfil"
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-white shadow-md"
          />
          <p>
            PeruMar<span className="text-red-500">.</span>
          </p>
        </div>

        <ul className="space-y-4 text-sm flex-1">
          {pathname === "/perfil" ? (
            <li
              onClick={() => {
                router.push("/screenhome");
                setOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
            >
              <User size={18} />
              Inicio
            </li>
          ) : (
            <li
              onClick={() => {
                router.push("/perfil");
                setOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
            >
              <UserCog size={18} />
              Cambiar datos
            </li>
          )}

          {pathname === "/cambiarpassword" ? (
            <li
              onClick={() => {
                router.push("/screenhome");
                setOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
            >
              <User size={18} />
              Inicio
            </li>
          ) : (
            <li
              onClick={() => {
                router.push("/cambiarpassword");
                setOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
            >
              <Lock size={18} />
              Cambiar contraseña
            </li>
          )}

          {/* SOLO PARA ADMINISTRADORES */}
          {user.rol === "admin" &&
            (pathname === "/usuarios" ? (
              <li
                onClick={() => {
                  router.push("/screenhome");
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
              >
                <User size={18} />
                Inicio
              </li>
            ) : (
              <li
                onClick={() => {
                  router.push("/usuarios");
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
              >
                <PersonStanding size={18} />
                Usuarios
              </li>
            ))}

          {user.rol === "admin" &&
            (pathname === "/reportes" ? (
              <li
                onClick={() => {
                  router.push("/screenhome");
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
              >
                <User size={18} />
                Inicio
              </li>
            ) : (
              <li
                onClick={() => {
                  router.push("/reportes");
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
              >
                <ChartColumn size={18} />
                Planillas Clientes
              </li>
            ))}
        </ul>

        {/* Anclado abajo */}
        <div
          onClick={() => {
            logout();
            setOpen(false);
            router.push("/login");
          }}
          className="mt-auto flex items-center gap-2 text-red-400 hover:text-red-600 cursor-pointer transition"
        >
          <LogOut size={18} />
          Cerrar sesión
        </div>
      </div>
    </div>
  );
}
