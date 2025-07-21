// /app/api/mercado-pago/estado/[externalReference]/route.js

export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET(req, context) {
  const externalReference = context.params.externalReference;

  if (!externalReference) {
    return new Response(
      JSON.stringify({ error: "Falta el parámetro externalReference" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const searchResult = await mercadopago.payment.search({
      qs: { external_reference: externalReference },
    });

    const pagos = searchResult.body.results;

    if (!pagos || pagos.length === 0) {
      return new Response(JSON.stringify({ status: "pending" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pagoMasReciente = pagos
      .filter((p) => p.status === "approved")
      .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))[0];

    return new Response(
      JSON.stringify({
        status: pagoMasReciente ? "approved" : pagos[0].status,
        id: pagoMasReciente?.id || pagos[0].id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al consultar estado:", error);
    return new Response(
      JSON.stringify({ error: "Error al consultar estado" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
