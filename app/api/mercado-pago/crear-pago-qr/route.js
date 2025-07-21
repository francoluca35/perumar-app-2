export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { total, nombreCliente } = body;

    const referencia = `resto-${Date.now()}`;

    const preference = {
      items: [
        {
          id: referencia,
          title: `Pedido Restaurante`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: parseFloat(total),
        },
      ],
      external_reference: referencia,
      payer: { name: nombreCliente || "Cliente" },
      notification_url:
        "https://perumar-app.vercel.app/api/mercado-pago/webhook",
      back_urls: {},
      auto_return: undefined,
    };

    const response = await mercadopago.preferences.create(preference);

    return new Response(
      JSON.stringify({
        init_point: response.body.init_point,
        preference_id: response.body.id,
        external_reference: referencia,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al crear preferencia QR:", error);
    return new Response(JSON.stringify({ error: "Error al generar el pago" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
