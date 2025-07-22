import { useEffect, useState } from "react";

export default function useMaps() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos", {
        cache: "no-store",
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setPedidos(data);
      } else {
        console.error("Respuesta inesperada:", data);
        setPedidos([]); // fallback vacío para evitar error en .filter
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return { pedidos, loading, refetch: fetchPedidos };
}
