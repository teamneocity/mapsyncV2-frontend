"use client";

import { useState } from "react";
import { GoogleMaps } from "@/components/googleMaps";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/services/api";

function parseAddressComponents(components = []) {
  const get = (type) =>
    components.find((c) => c.types.includes(type))?.long_name || "";

  const street = get("route");
  const zipcode = get("postal_code");
  const neighborhoodName = get("neighborhood") || get("sublocality_level_1");
  return { street, zipcode, neighborhoodName };
}

export function AddressUpdateDialog({
  occurrenceId,
  neighborhoods = [],
  currentNeighborhoodId,
  initialLat = -10.9472,
  initialLng = -37.0731,
  onSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    street: "",
    zipcode: "",
    reason: "Correção completa de endereço",
    neighborhoodId: currentNeighborhoodId || "",
  });

  const handleMapClick = async ({ lat, lng }) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results?.[0]) {
        const parsed = parseAddressComponents(
          data.results[0].address_components
        );

        // encontra o bairro por nome (case-insensitive)
        const match =
          neighborhoods.find(
            (n) =>
              n.name?.trim().toLowerCase() ===
              (parsed.neighborhoodName || "").trim().toLowerCase()
          ) || null;

        setForm((prev) => ({
          ...prev,
          street: parsed.street || prev.street,
          zipcode:
            (parsed.zipcode || "").replace(/\D/g, "").slice(0, 8) ||
            prev.zipcode,
          neighborhoodId:
            match?.id || prev.neighborhoodId || currentNeighborhoodId || "",
        }));
      }
    } catch (e) {
      console.error("Erro no geocode:", e);
    }
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);

      // ⬇️ EXATAMENTE o payload que sua rota aceita
      await api.patch(`/occurrences/${occurrenceId}/address`, {
        street: form.street || "",
        zipcode: form.zipcode || "",
        neighborhoodId: form.neighborhoodId,
        reason: form.reason || "Correção completa de endereço",
      });

      const neighborhoodName =
        neighborhoods.find((n) => n.id === form.neighborhoodId)?.name || "";

      // devolve para o Analysis refletir imediatamente
      onSuccess?.({
        street: form.street || "",
        zipCode: form.zipcode || "",
        neighborhoodId: form.neighborhoodId,
        neighborhoodName,
      });

      setOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Erro ao atualizar endereço.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-[55px] px-4 bg-white hover:bg-gray-100 text-[#787891] justify-start">
          Altere o endereço se necessário for
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl w-full h-[70vh]">
        <DialogHeader>
          <DialogTitle>Alterar endereço</DialogTitle>
          <DialogDescription>
            Clique no mapa para preencher rua, CEP e bairro automaticamente.
            Ajuste os campos se necessário e confirme.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Mapa */}
          <div className="relative w-full h-[40vh] md:h-full rounded border overflow-hidden">
            <GoogleMaps
              position={{ lat: initialLat, lng: initialLng }}
              fullHeight
              label="ocorrencia"
              onMapClick={handleMapClick}
            />
            {(form.street || form.zipcode) && (
              <div className="absolute bottom-2 left-2 bg-white text-xs px-2 py-[2px] rounded shadow-sm text-gray-600">
                {form.street} {form.zipcode ? `- CEP ${form.zipcode}` : ""}
              </div>
            )}
          </div>

          {/* Form mínimo (somente o que a rota aceita) */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-[#787891] font-semibold">
                Rua
              </label>
              <Input
                value={form.street}
                onChange={(e) =>
                  setForm((p) => ({ ...p, street: e.target.value }))
                }
                placeholder="Ex.: Rua Flávio Menezes Prado"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-[#787891] font-semibold">
                CEP
              </label>
              <Input
                value={form.zipcode}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    zipcode: e.target.value.replace(/\D/g, "").slice(0, 8),
                  }))
                }
                placeholder="Ex.: 49038443"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Envie apenas números (ex.: 49038443).
              </p>
            </div>

            <div>
              <label className="text-sm text-[#787891] font-semibold">
                Motivo
              </label>
              <Input
                value={form.reason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="Motivo da alteração"
                className="mt-1"
              />
            </div>

            <div className="mt-auto" />

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirm}
                disabled={
                  saving ||
                  !form.street ||
                  !form.zipcode ||
                  !form.neighborhoodId
                }
                title={
                  !form.neighborhoodId
                    ? "Bairro não identificado pelo mapa"
                    : undefined
                }
              >
                {saving ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
