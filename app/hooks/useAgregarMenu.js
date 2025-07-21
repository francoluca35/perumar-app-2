import { useState } from "react";
import axios from "axios";

export default function useAgregarMenu() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const agregarMenu = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await axios.post("/api/menu/agregar", formData);
      setSuccess(true);
      return res.data;
    } catch (err) {
      console.error(err);
      setError("Error al agregar menú");
    } finally {
      setLoading(false);
    }
  };

  return { agregarMenu, loading, error, success };
}
