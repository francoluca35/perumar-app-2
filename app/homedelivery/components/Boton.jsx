"use client";

export default function Boton({ children, onClick, disabled, color = "blue" }) {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition duration-300 ease-in-out shadow-md flex items-center justify-center gap-2";
  const colors = {
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-black",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${colors[color]} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}
