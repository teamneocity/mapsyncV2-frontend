// src/components/googleMaps.jsx
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

function parseAddress(components = []) {
  const get = (type) =>
    components.find((c) => c.types.includes(type))?.long_name || "";

  const street = get("route");
  const number = get("street_number");
  const city =
    get("sublocality_level_1") || get("locality") || get("administrative_area_level_2");
  const state = get("administrative_area_level_1");
  const zipCode = get("postal_code");

  return { street, number, city, state, zipCode };
}

export function GoogleMaps({
  position,
  label,
  fullHeight,
  onMapClick,
  onAddressDetected,
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM",
  });

  return (
    <div className={`w-full ${fullHeight ? "h-full" : "h-[100%]"}`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={position}
          zoom={15}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            if (onMapClick) onMapClick({ lat, lng });

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results?.[0]) {
                const addr = parseAddress(results[0].address_components);
                const payload = {
                  ...addr,
                  latitude: lat,
                  longitude: lng,
                  formatted: results[0].formatted_address || "",
                };
                if (onAddressDetected) onAddressDetected(payload);
              } else {
                if (onAddressDetected)
                  onAddressDetected({
                    street: "",
                    number: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    latitude: lat,
                    longitude: lng,
                    formatted: "",
                  });
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
                  ? { text: label, fontSize: "14px", color: "#000" }
                  : undefined,
            }}
          />
        </GoogleMap>
      ) : null}
    </div>
  );
}
