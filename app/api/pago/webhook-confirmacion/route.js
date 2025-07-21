export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { mesa, total, metodo, nombreCliente } = body;

    // 🧾 Enviar a tu backend que imprime
    await fetch("http://localhost:4000/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa,
        total,
        nombreCliente,
        metodoPago: metodo,
        productos: [], // Aquí podrías buscar los productos en DB si querés que aparezcan
      }),
    });

    // 💰 Guardar en caja (si usás API para registrar ingresos)
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/caja/ingreso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "restaurante",
        monto: total,
        descripcion: `Ingreso automático por mesa ${mesa}`,
        metodo: metodo.toLowerCase(),
      }),
    });

    // ✅ Liberar la mesa
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mesas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa,
        productos: [],
        metodoPago: metodo,
        total,
        estado: "libre",
        hora: "",
        fecha: "",
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error en webhook-confirmacion:", error);
    return new Response(
      JSON.stringify({ error: "Error al procesar confirmación" }),
      { status: 500 }
    );
  }
}
