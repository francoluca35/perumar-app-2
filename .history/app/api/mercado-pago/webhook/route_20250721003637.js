export const runtime = "nodejs";
import mercadopago from "mercadopago";
import { connectDB } from "@/lib/mongodb";
import Pago from "@/app/models/Pago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const tipo = body.type || body.action;
    const paymentId = body.data?.id;

    if (tipo === "payment" && paymentId) {
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === "approved") {
        const referencia = payment.body.external_reference;
        const total = payment.body.transaction_amount;

        await connectDB();
        await Pago.create({ referencia, total, status: "approved" });

        await fetch("http://192.168.1.100:4000/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mesa: referencia,
            productos: [],
            total,
            metodo: "Mercado Pago",
          }),
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    return new Response("Error interno", { status: 500 });
  }
}
