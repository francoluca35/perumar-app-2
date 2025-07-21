// models/Cliente.js
import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  mesa: { type: Number, required: true },
  metodoPago: { type: String, required: true },
  productos: { type: Array, required: true },
  total: { type: Number, required: true },
  fecha: { type: String, required: true }, // o tipo Date si preferís
});

export default mongoose.models.Cliente ||
  mongoose.model("Cliente", clienteSchema);
