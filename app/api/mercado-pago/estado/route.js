export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const external_reference = searchParams.get("id");

    if (!external_reference) {
      return new Response(
        JSON.stringify({ error: "Falta external_reference" }),
        { status: 400 }
      );
    }

    const result = await mercadopago.payment.search({
      qs: { external_reference },
    });

    const pagos = result.body.results;

    if (!pagos || pagos.length === 0) {
      return new Response(JSON.stringify({ status: "pending" }), {
        status: 200,
      });
    }

    const aprobado = pagos.find((p) => p.status === "approved");

    if (aprobado) {
      return new Response(
        JSON.stringify({ status: "approved", id: aprobado.id }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ status: pagos[0].status || "pending" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error al obtener estado pago:", err);
    return new Response(
      JSON.stringify({ error: "Error al consultar estado" }),
      { status: 500 }
    );
  }
}
