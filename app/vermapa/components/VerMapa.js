"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "@/app/hooks/useUbicacion";
import { entregarPedidoPorId } from "@/utils/entregarPedidoPorId";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);
  const [duracionEstimanda, setDuracionEstimanda] = useState(null);
  const mapRef = useRef(null);
  const destinoRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const usuarioMarkerRef = useRef(null);

  const { iniciarSeguimiento } = useUbicacion();
  const [pedidoEntregado, setPedidoEntregado] = useState(false);
  const [cargandoEntrega, setCargandoEntrega] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  useEffect(() => {
    if (pedido && window.google) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.6037, lng: -58.3816 },
        zoom: 14,
      });
      mapRef.current = map;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: pedido.direccion }, (results, status) => {
        if (status === "OK") {
          const destino = results[0].geometry.location;
          destinoRef.current = destino;
          new window.google.maps.Marker({
            position: destino,
            map,
            title: pedido.direccion,
          });
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido]);
  useEffect(() => {
    if (seguimientoActivo && mapRef.current && destinoRef.current) {
      iniciarSeguimiento(
        mapRef.current,
        destinoRef.current,
        markerRef,
        directionsRendererRef,
        setDuracionEstimanda,
        usuarioMarkerRef
      );
    }
  }, [seguimientoActivo, iniciarSeguimiento]);

  const centrarEnMiUbicacion = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        mapRef.current.setCenter(ubicacion);
        mapRef.current.setZoom(17);
      },
      (err) => console.error("No se pudo centrar en la ubicación:", err),
      { enableHighAccuracy: true }
    );
  };

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="relative min-h-screen">
      <div id="map" className="absolute inset-0 z-0" />

      {/* Botón de centrar ubicación */}
      <button
        onClick={centrarEnMiUbicacion}
        className="absolute bottom-28 right-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
        title="Centrar en mi ubicación"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.536 6.364l-1.414-1.414M6.879 6.879L5.465 5.465m0 13.899l1.414-1.414m11.313-11.313l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      </button>

      {/* Card info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="bg-black/90 text-white rounded-3xl p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-2">
            Cliente: {pedido.nombre}
          </h2>
          <p className="text-sm">📍 {pedido.direccion}</p>
          <p className="text-sm font-semibold mb-2">
            💰 Total: ${pedido.total}
          </p>

          {duracionEstimanda && (
            <p className="text-green-400 text-sm mb-2">
              ⏱ Tiempo estimado: <strong>{duracionEstimanda}</strong>
            </p>
          )}

          <button
            onClick={() => setSeguimientoActivo(true)}
            className="w-full bg-white text-black font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition"
          >
            {seguimientoActivo ? "🟢 Seguimiento activo" : "Iniciar ruta"}
          </button>
          {!pedidoEntregado ? (
            <button
              onClick={async () => {
                const confirmacion = await Swal.fire({
                  title: "¿Entregar este pedido?",
                  text: "Confirmá que este pedido fue entregado al cliente.",
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonText: "Sí, entregar",
                  cancelButtonText: "Cancelar",
                  confirmButtonColor: "#10b981", // verde
                });

                if (confirmacion.isConfirmed) {
                  setCargandoEntrega(true);
                  const horaEntrega = new Date().toISOString();

                  try {
                    const res = await fetch("/api/pedidos/entregar", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id, horaEntrega }),
                    });

                    if (!res.ok) throw new Error();

                    await Swal.fire({
                      title: "✅ Entregado",
                      text: "El pedido fue marcado como entregado.",
                      icon: "success",
                      confirmButtonText: "OK",
                      confirmButtonColor: "#10b981",
                      timer: 2000,
                    });

                    setPedidoEntregado(true);
                    router.back(); // ← Volver a la vista anterior
                  } catch (error) {
                    await Swal.fire({
                      title: "❌ Error",
                      text: "No se pudo entregar el pedido.",
                      icon: "error",
                      confirmButtonText: "Cerrar",
                    });
                  } finally {
                    setCargandoEntrega(false);
                  }
                }
              }}
              disabled={cargandoEntrega}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-full font-bold transition 
      ${
        cargandoEntrega
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white"
      }`}
            >
              {cargandoEntrega ? "Entregando..." : "✅ Entregar Pedido"}
            </button>
          ) : (
            <div className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-green-700 text-white font-bold animate-pulse">
              ✅ Pedido entregado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
