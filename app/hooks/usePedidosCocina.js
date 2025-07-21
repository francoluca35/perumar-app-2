"use client";
import { useState, useEffect } from "react";

export default function usePedidosCocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    const res = await fetch("/api/cocina");
    const data = await res.json();
    setPedidos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return { pedidos, loading, refetch: fetchPedidos };
}
