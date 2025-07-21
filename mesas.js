export function obtenerTipoMesa(mesasDoc, codigo) {
  if (mesasDoc.mesaAdentro?.some((m) => m.codigo === codigo)) {
    return "mesaAdentro";
  }
  if (mesasDoc.mesaAdentro2?.some((m) => m.codigo === codigo)) {
    return "mesaAdentro2";
  }
  if (mesasDoc.mesaAfuera?.some((m) => m.codigo === codigo)) {
    return "mesaAfuera";
  }
  return null; // No encontrado
}
