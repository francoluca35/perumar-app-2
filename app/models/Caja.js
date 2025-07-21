import mongoose from "mongoose";

const CajaSchema = new mongoose.Schema({
  montoActual: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default mongoose.models.Caja || mongoose.model("Caja", CajaSchema);
