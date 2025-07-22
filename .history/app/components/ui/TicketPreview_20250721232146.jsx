export default function TicketPreview({
  productos,
  mesa,
  hora,
  fecha,
  onPrint,
  onEnviar,
  onCancelar,
}) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white w-[300px] p-4 shadow-lg">
        <h2 className="text-center font-bold mb-2">
          TICKET MESA {mesa.numero}
        </h2>
        <p>Fecha: {fecha}</p>
        <p>Hora: {hora}</p>
        <hr className="my-2" />
        {productos.map((prod, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {prod.cantidad}x {prod.nombre}
            </span>
            <span>${(prod.precio * prod.cantidad).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-2" />
        <p className="font-bold text-right">
          Total: $
          {productos.reduce((a, p) => a + p.precio * p.cantidad, 0).toFixed(2)}
        </p>
        <div className="flex justify-between mt-4">
          <button
            onClick={onCancelar}
            className="text-sm bg-gray-300 px-3 py-1 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onPrint}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
          >
            Imprimir
          </button>
          <button
            onClick={onEnviar}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
