import { useState, useEffect } from "react";

export default function useCajaRegistradora() {
  const [monto, setMonto] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCaja = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/caja-registradora");
      const data = await res.json();
      setMonto(data.montoActual);
    } catch (err) {
      console.error("Error cargando caja:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarCaja = async (nuevoMonto) => {
    try {
      const res = await fetch("/api/caja-registradora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: nuevoMonto }),
      });

      if (res.ok) {
        await fetchCaja();
      } else {
        console.error("Error al actualizar caja");
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  useEffect(() => {
    fetchCaja();
  }, []);

  return { monto, loading, actualizarCaja };
}
