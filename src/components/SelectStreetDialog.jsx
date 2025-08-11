import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { api } from "@/services/api";

export function SelectStreetDialog({ occurrenceId, lat, lng, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [clickedAddress, setClickedAddress] = useState("");
  const [clickedCoords, setClickedCoords] = useState(null);

  const handleConfirm = async () => {
    try {
      await api.patch(`/occurrences/${occurrenceId}/address`, {
        newAddress: clickedAddress,
      });
      if (onSuccess) onSuccess();
      setOpen(false);
    } catch (error) {
      alert("Erro ao atualizar o endereço: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#E6F0FF] text-[#004A99] hover:bg-blue-100">
          Alterar rua
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl w-full h-[80vh]">
        <VisuallyHidden>
          <DialogTitle>Selecionar nova rua</DialogTitle>
          <DialogDescription>
            Clique em um local do mapa para atualizar o endereço da ocorrência.
          </DialogDescription>
        </VisuallyHidden>

        <div className="relative w-full h-full">
          <GoogleMaps
            position={{ lat, lng }}
            fullHeight
            label="ocorrência"
            onMapClick={({ lat, lng }) => {
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
                    setClickedAddress(enderecoCompleto);
                    setClickedCoords({ lat, lng });
                    console.log("Endereço completo:", enderecoCompleto);
                  } else {
                    console.warn("Rua ou número não encontrado");
                    setClickedAddress("");
                    setClickedCoords(null);
                  }
                } else {
                  console.error("Erro ao buscar endereço:", status);
                  setClickedAddress("");
                  setClickedCoords(null);
                }
              });
            }}
          />

          {clickedAddress && (
            <div className="absolute bottom-1 left-1 bg-white text-xs px-2 py-[2px] rounded shadow-sm text-gray-500 z-20 max-w-[75%]">
              Rua clicada: {clickedAddress}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={handleConfirm}
            disabled={!clickedAddress}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Confirmar novo endereço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
