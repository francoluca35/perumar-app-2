// models/Pago.js

import mongoose from "mongoose";

const PagoSchema = new mongoose.Schema({
  external_reference: { type: String, required: true },
  status: { type: String, required: true },
  nombreCliente: { type: String },
  mesa: { type: String },
  monto: { type: Number },
  fecha: { type: Date, default: Date.now },
});

export default mongoose.models.Pago || mongoose.model("Pago", PagoSchema);
