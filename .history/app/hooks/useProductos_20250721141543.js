import { useEffect, useState } from "react";

export default function useProductos() {
  const [productos, setProductos] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products"); // 🔁 Asegurate que este endpoint esté bien
      if (!res.ok) throw new Error("Error al cargar productos");

      const data = await res.json();
      setProductos(data);
      setBebidas(data.filter((item) => item.tipo === "bebida"));
    } catch (err) {
      setError(err.message);
      console.error("❌ Error en fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { productos, bebidas, refetch: fetchData, loading, error };
}
