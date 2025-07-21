import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { tipo, cantidad } = await req.json();
    const tipoSanitizado = tipo.trim();
    const tiposValidos = ["mesaAdentro", "mesaAdentro2", "mesaAfuera"];

    if (!tiposValidos.includes(tipoSanitizado)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const docRef = doc(db, "tables", "estadoMesas");
    const docSnap = await getDoc(docRef);
    const mesas = docSnap.exists() ? docSnap.data() : {
      mesaAdentro: [],
      mesaAdentro2: [],
      mesaAfuera: []
    };

    const nuevasMesas = Array.from({ length: cantidad }, () => ({
      estado: "libre",
      cliente: null,
