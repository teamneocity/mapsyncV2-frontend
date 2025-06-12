import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <Card className="w-1/3 p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">{message}</h2>
          <div className="flex gap-4 justify-center">
            <Button className="bg-green-500" onClick={() => { onConfirm(); onClose(); }}>
              Confirmar
            </Button>
            <Button className="bg-red-500" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
