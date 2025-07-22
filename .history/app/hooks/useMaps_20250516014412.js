import { useEffect, useState } from "react";

export default function useMaps() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/maps", {
        cache: "no-store",
      });
      const data = await res.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return { pedidos, loading, refetch: fetchPedidos }; // <- ⚠️ agrega refetch
}
