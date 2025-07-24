import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

export function GoogleMaps({ position, label }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM",
  });

  return (
    <div className="w-full h-full">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={position}
          zoom={15}
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
