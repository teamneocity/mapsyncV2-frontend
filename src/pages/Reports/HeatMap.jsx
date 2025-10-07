import React, { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { Maximize2, X } from "lucide-react";

function heatMap({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 18,
      minOpacity: 0.3,
      ...options,
    }).addTo(map);

    const latlngs = points.map(([lat, lng]) => [lat, lng]);
    if (latlngs.length > 0) {
      const bounds = L.latLngBounds(latlngs);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    return () => {
      layer.remove();
    };
  }, [map, points, options]);

  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function MapaDeCalor({ dados = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const heatPoints = useMemo(() => {
    return dados
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
      .map((p) => [p.lat, p.lng, 1]); // peso fixo = 1
  }, [dados]);

  const center = useMemo(() => {
    if (heatPoints.length) return [heatPoints[0][0], heatPoints[0][1]];
    return [-10.9472, -37.0731]; 
  }, [heatPoints]);

  return (
    <>
      {/* mapa normal */}
      {!isExpanded && (
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden shadow">
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatLayer points={heatPoints} />
          </MapContainer>

          {/* botão expandir */}
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute top-3 right-3 z-50 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition pointer-events-auto"
            style={{ zIndex: 1001 }}
            aria-label="Expandir mapa"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* modal fullscreen */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
          <div className="relative w-full h-full">
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <HeatLayer points={heatPoints} />
              <InvalidateOnMount />
            </MapContainer>

            {/* botão fechar */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 z-50 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition pointer-events-auto"
              style={{ zIndex: 1001 }}
              aria-label="Fechar mapa"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
