import { useState } from "react";

export default function useEditarMenu() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editarMenu = async (menuActualizado) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/menu/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuActualizado),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al editar el menú");
      }

      return true;
    } catch (err) {
      console.error("Error editando menú:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editarMenu, loading, error };
}
