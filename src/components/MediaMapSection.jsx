import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GoogleMaps } from "@/components/googleMaps";

export function MediaMapSection({ photoUrls = [], lat, lng, className = "" }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? photoUrls.length - 1 : prev - 1));

  const nextImage = () =>
    setCurrentIndex((prev) => (prev === photoUrls.length - 1 ? 0 : prev + 1));

  const currentPhoto = photoUrls[currentIndex] || { label: "", url: null };

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Carrossel de imagem */}
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
          <DialogTrigger asChild>
            <div className="relative h-52 md:h-full w-full rounded-md border overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center">
              {/* Legenda da etapa */}
              <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 text-xs font-semibold rounded shadow">
                {currentPhoto.label}
              </div>

              {currentPhoto.url ? (
                <img
                  src={currentPhoto.url}
                  alt={`Imagem ${currentIndex + 1}`}
                  className="h-full w-full object-cover rounded-md"
                />
              ) : (
                <div className="text-gray-400 text-center px-4">
                  Foto não anexada ainda
                </div>
              )}

              {/* Botões do carrossel */}
              {photoUrls.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="bg-black/50 text-white rounded-full px-3 py-1 text-sm"
                  >
                    ◀ Anterior
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="bg-black/50 text-white rounded-full px-3 py-1 text-sm"
                  >
                    Próxima ▶
                  </button>
                </div>
              )}
            </div>
          </DialogTrigger>

          {/* Modal só aparece se tiver imagem */}
          {currentPhoto.url && (
            <DialogContent className="max-w-4xl w-full">
              <img
                src={currentPhoto.url}
                alt={`Imagem expandida ${currentIndex + 1}`}
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
            <GoogleMaps position={{ lat, lng }} fullHeight label="ocorrencia" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
