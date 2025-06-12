import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function IgnoreOccurrenceModal({ isOpen, onClose, onConfirm, message }) {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(reason)
    onClose()
    setReason("") 
  }

  const handleClose = () => {
    onClose()
    setReason("") // Reset the reason when closing without confirming
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{message}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo para ignorar a ocorrência</Label>
              <Textarea
                id="reason"
                placeholder="Digite o motivo pelo qual esta ocorrência está sendo ignorada..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="default" onClick={handleConfirm}>
            Confirmar
          </Button>
          <Button variant="destructive" onClick={handleClose}>
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

