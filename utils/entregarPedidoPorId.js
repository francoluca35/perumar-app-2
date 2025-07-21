export const entregarPedidoPorId = async (id) => {
  const confirmar = confirm("¿Marcar este pedido como entregado?");
  if (!confirmar) return;

  try {
    const horaEntrega = new Date().toISOString();
    await fetch("/api/pedidos/entregar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, horaEntrega }),
    });

    alert("✅ Pedido entregado");
    return true;
  } catch (error) {
    console.error("Error entregando pedido:", error);
    alert("❌ Error al entregar");
    return false;
  }
};
