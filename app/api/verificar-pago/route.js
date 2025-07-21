// app/api/verificar-pago/route.js
import { connectToDatabase } from "@/lib/db";
import Pago from "@/app/models/Pago";

export async function GET(req) {
  const referencia = new URL(req.url).searchParams.get("id");
  await connectToDatabase();
  const pago = await Pago.findOne({ referencia });

  return Response.json({ status: pago?.status || "pending" });
}
