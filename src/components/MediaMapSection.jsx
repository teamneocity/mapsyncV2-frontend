
import { useState } from "react";
import {
 Dialog,
 DialogContent,
 DialogTrigger,
 DialogTitle,
 DialogDescription,
} from "@/components/ui/dialog";
import { GoogleMaps } from "@/components/googleMaps";


import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


export function MediaMapSection({ photoUrls = [], lat, lng, className = "" }) {
 const [photoOpen, setPhotoOpen] = useState(false);
 const [mapOpen, setMapOpen] = useState(false);
 const [currentIndex, setCurrentIndex] = useState(0);


 const [zoomLevel, setZoomLevel] = useState(1);
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const [offset, setOffset] = useState({ x: 0, y: 0 });


 const prevImage = () =>
   setCurrentIndex((prev) => (prev === 0 ? photoUrls.length - 1 : prev - 1));


 const nextImage = () =>
   setCurrentIndex((prev) => (prev === photoUrls.length - 1 ? 0 : prev + 1));


 const currentPhoto = photoUrls[currentIndex] || { label: "", url: null };


 const [ruaClicada, setRuaClicada] = useState(null);


 return (
   <div className={`w-full h-full ${className}`}>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[208px] md:h-full">
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
             <VisuallyHidden>
               <DialogTitle>Visualização da Imagem</DialogTitle>
               <DialogDescription>
                 Imagem expandida do serviço executado
               </DialogDescription>
             </VisuallyHidden>


             <div
               onDoubleClick={() => {
                 setZoomLevel((prev) => (prev >= 3 ? 1 : prev + 1));
                 setOffset({ x: 0, y: 0 });
               }}
               onMouseDown={(e) => {
                 if (zoomLevel > 1) {
                   setIsDragging(true);
                   setDragStart({
                     x: e.clientX - offset.x,
                     y: e.clientY - offset.y,
                   });
                 }
               }}
               onMouseMove={(e) => {
                 if (isDragging) {
                   setOffset({
                     x: e.clientX - dragStart.x,
                     y: e.clientY - dragStart.y,
                   });
                 }
               }}
               onMouseUp={() => setIsDragging(false)}
               onMouseLeave={() => setIsDragging(false)}
               className={`w-full h-full flex items-center justify-center overflow-hidden ${
                 zoomLevel > 1 ? "cursor-grabbing" : "cursor-zoom-in"
               }`}
             >
               <img
                 src={currentPhoto.url}
                 alt={`Imagem expandida ${currentIndex + 1}`}
                 className="transition-transform duration-300 object-contain"
                 style={{
                   maxHeight: "80vh",
                   transform: `scale(${zoomLevel}) translate(${offset.x}px, ${offset.y}px)`,
                   cursor: zoomLevel > 1 ? "grab" : "zoom-in",
                 }}
                 draggable={false}
               />
             </div>
           </DialogContent>
         )}
       </Dialog>


       {/* Mapa */}
       <Dialog open={mapOpen} onOpenChange={setMapOpen}>
         <DialogTrigger asChild>
           <div className="h-full w-full rounded-md border overflow-hidden cursor-pointer">
             <GoogleMaps position={{ lat, lng }} label="ocorrencia" />
           </div>
         </DialogTrigger>


         <DialogContent className="max-w-5xl w-full h-[80vh]">
           <VisuallyHidden>
             <DialogTitle>Mapa de localização</DialogTitle>
             <DialogDescription>
               Visualização ampliada do local da ocorrência
             </DialogDescription>
           </VisuallyHidden>


           <div className="relative w-full h-full">
             <GoogleMaps
               position={{ lat, lng }}
               fullHeight
               label="ocorrencia"
               onMapClick={async ({ lat, lng }) => {
                 const res = await fetch(
                   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM`
                 );
                 const data = await res.json();
                 const rua =
                   data.results?.[0]?.formatted_address ??
                   "Rua não encontrada";
                 setRuaClicada(rua);
               }}
             />


             {ruaClicada && (
               <div className="absolute bottom-1 left-1 bg-white text-xs px-2 py-[2px] rounded shadow-sm text-gray-500 z-20 max-w-[75%]">
                 Rua clicada: {ruaClicada}
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>
     </div>
   </div>
 );
}
