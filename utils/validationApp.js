export function validarImagenMenu(file) {
  const limiteMB = 1.5;
  const maxSize = limiteMB * 1024 * 1024; // 1.5MB en bytes

  if (file && file.size > maxSize) {
    return `La imagen no debe superar los ${limiteMB}MB.`;
  }

  return null;
}
