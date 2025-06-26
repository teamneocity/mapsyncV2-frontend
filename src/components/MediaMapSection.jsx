// src/components/MediaMapSection.jsx
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GoogleMaps } from "@/components/googleMaps";

export function MediaMapSection({ photoUrl, lat, lng, className = "" }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Layout responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Imagem */}
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
          <DialogTrigger asChild>
            <div className="h-52 md:h-full w-full rounded-md border overflow-hidden cursor-pointer">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Imagem da ocorrência"
                  className="h-full w-full object-cover rounded-md"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100">
                  Sem imagem
                </div>
              )}
            </div>
          </DialogTrigger>
          {photoUrl && (
            <DialogContent className="max-w-4xl w-full">
              <img
                src={photoUrl}
                alt="Imagem expandida"
                className="w-full max-h-[80vh] object-contain"
              />
            </DialogContent>
          )}
        </Dialog>

        {/* Mapa */}
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogTrigger asChild>
            <div className="h-52 md:h-full w-full rounded-md border overflow-hidden cursor-pointer">
              <GoogleMaps position={{ lat, lng }} label="ocorrencia" />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[80vh]">
            <GoogleMaps
              position={{ lat, lng }}
              fullHeight
              label="ocorrencia"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
