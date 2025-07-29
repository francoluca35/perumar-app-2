import { useEffect, useState } from "react";

export default function useMesas() {
  const [mesas, setMesas] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMesas = async () => {
    try {
      const res = await fetch("/api/mesas");
      const text = await res.text();
      if (!text) throw new Error("Respuesta vacía");

      const data = JSON.parse(text);

      if (!data[0]) throw new Error("Sin datos de mesas");

      setMesas(data[0]);
    } catch (error) {
      console.error("Error cargando mesas:", error);
      setMesas({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  return { mesas, loading, refetch: fetchMesas };
}
