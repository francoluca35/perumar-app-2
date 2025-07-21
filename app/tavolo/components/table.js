"use client";

import Mesas from "@/app/components/Mesas";
import { Suspense, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";

export default function Table() {
  const [pisoActivo, setPisoActivo] = useState("Piso 01");

  const reload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackArrow />
          <div className="flex items-center gap-3">
            <Image
              src="/Assets/logoapp.png"
              alt={"logo"}
              width={50}
              height={40}
              className="rounded-full object-cover border-2 border-white shadow-md"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">
              PeruMar<span className="text-blue-400">.</span>
            </h1>
          </div>
        </div>

        <button
          onClick={reload}
          className="p-2 border border-blue-400 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
          title="Recargar"
        >
          <FaSyncAlt size={16} />
        </button>
      </header>

      {/* Lista de mesas con Suspense */}
      <main className="p-6">
        <Suspense
          fallback={
            <p className="text-white text-center text-lg animate-pulse">
              Cargando mesas...
            </p>
          }
        >
          <Mesas />
        </Suspense>
      </main>
    </div>
  );
}
