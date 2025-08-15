import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

export function GoogleMaps({ position, label, fullHeight, onMapClick, onAddressDetected }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM", // 🔐 chave fixa
  });

  return (
    <div className="w-full h-full">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={position}
          zoom={15}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // Callback externo se quiser usar posição
            if (onMapClick) {
              onMapClick({ lat, lng });
            }

            // Geocodificação reversa
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results[0]) {
                const components = results[0].address_components;

                const rua = components.find((comp) =>
                  comp.types.includes("route")
                )?.long_name;

                const numero = components.find((comp) =>
                  comp.types.includes("street_number")
                )?.long_name;

                if (rua && numero) {
                  const enderecoCompleto = `${rua}, ${numero}`;
                  console.log("Endereço completo:", enderecoCompleto);

                  if (onAddressDetected) {
                    onAddressDetected(enderecoCompleto, lat, lng);
                  }
                } else {
                  console.log("Rua ou número não encontrado");
                  if (onAddressDetected) {
                    onAddressDetected(null, lat, lng);
                  }
                }
              } else {
                console.error("Erro ao buscar endereço:", status);
                if (onAddressDetected) {
                  onAddressDetected(null, lat, lng);
                }
              }
            });
          }}
          options={{
            disableDefaultUI: true,
            scrollwheel: true,
            draggable: true,
          }}
        >
          <Marker
            position={position}
            options={{
              label:
                typeof label === "string"
                  ? {
                      text: label,
                      fontSize: "14px",
                      color: "#000",
                    }
                  : undefined,
            }}
          />
        </GoogleMap>
      ) : null}
    </div>
  );
}