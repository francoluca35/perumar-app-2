"use client";
export default function useUbicacion() {
  const iniciarSeguimiento = (
    map,
    destino,
    markerRef,
    directionsRendererRef,
    setDuracionEstimanda
  ) => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          suppressMarkers: true,
          preserveViewport: true,
        }
      );
      directionsRendererRef.current.setMap(map);
    }

    navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: ubicacion,
            map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            title: "Tu ubicación",
          });
        } else {
          markerRef.current.setPosition(ubicacion);
        }

        directionsService.route(
          {
            origin: ubicacion,
            destination: destino,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK") {
              directionsRendererRef.current.setDirections(result);

              const duration =
                result.routes[0]?.legs[0]?.duration?.text || null;
              if (duration) {
                setDuracionEstimanda(duration);
              }
            } else {
              console.error("Error al calcular ruta:", status);
            }
          }
        );
      },
      (err) => {
        console.error("Error en geolocalización:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  };

  return { iniciarSeguimiento };
}
