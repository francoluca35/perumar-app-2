"use client";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function BackArrow({ label = "Volver" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-white hover:text-orange-400 transition"
    >
      <FaArrowLeft />
      {label}
    </button>
  );
}
