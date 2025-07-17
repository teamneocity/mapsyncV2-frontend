import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

function HeatmapLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L || points.length === 0) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const heatLayer = window.L.heatLayer(points, {
      radius: 50,
      blur: 30,
      maxZoom: 17,
      max: 1,
      gradient: {
        0.0: "green",
        0.4: "yellow",
        0.7: "orange",
        1.0: "red",
      },
    }).addTo(map);

    layerRef.current = heatLayer;

    if (points.length > 1) {
      const bounds = window.L.latLngBounds(
        points.map(([lat, lng]) => [lat, lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [points, map]);

  return null;
}

function MapaBase({ altura = "400px", dadosApi = [] }) {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const pontos = dadosApi.flatMap((item) => {
      const lat = item.address.latitude;
      const lng = item.address.longitude;
      return [[lat, lng, dadosApi.length === 1 ? 20 : 5]];
    });

    setDados(pontos);
  }, [dadosApi]);

  // Zoom mínimo se só tiver um ponto
  const zoomInicial = dadosApi.length === 1 ? 11 : 13;
  const centro = [-10.9472, -37.0731];

  return (
    <div
      style={{ height: altura, width: "100%" }}
      className="rounded-lg overflow-hidden shadow"
    >
      <MapContainer
        center={centro}
        zoom={zoomInicial}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={dados} />
      </MapContainer>
    </div>
  );
}

export default function MapaDeCalor({ dados = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isOpen && (
        <DialogTrigger asChild>
          <div className="cursor-pointer w-full h-[400px]">
            <MapaBase altura="100%" dadosApi={dados} />
          </div>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-[95vw] h-[90vh] p-2">
        <MapaBase altura="100%" dadosApi={dados} />
      </DialogContent>
    </Dialog>
  );
}
