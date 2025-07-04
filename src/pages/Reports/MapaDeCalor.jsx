import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { heatmapData } from "./mock";

function HeatmapLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    if (points.length > 0 && window.L.heatLayer) {
      const heatLayer = window.L.heatLayer(points, {
        radius: 50,
        blur: 30,
        maxZoom: 17,
        max: 1,
        gradient: {
          0.0: 'green',
          0.4: 'yellow',
          0.7: 'orange',
          1.0: 'red',
        },
      }).addTo(map);

      layerRef.current = heatLayer;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [points, map]);

  return null;
}

function MapaBase({ altura = "400px" }) {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const pontos = [];

    heatmapData.forEach((p) => {
      for (let i = 0; i < p.peso; i++) {
        pontos.push([
          p.lat + (Math.random() - 0.5) * 0.0003,
          p.lng + (Math.random() - 0.5) * 0.0003,
          1,
        ]);
      }
    });

    setDados(pontos);
  }, []);

  const centro = [-10.9472, -37.0731];

  return (
    <div style={{ height: altura, width: "100%" }} className="rounded-lg overflow-hidden shadow">
      <MapContainer
        center={centro}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={dados} />
      </MapContainer>
    </div>
  );
}

export default function MapaDeCalor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isOpen && (
        <DialogTrigger asChild>
          <div className="cursor-pointer w-full h-[400px]">
            <MapaBase altura="100%" />
          </div>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-[95vw] h-[90vh] p-2">
        <MapaBase altura="100%" />
      </DialogContent>
    </Dialog>
  );
}
