"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/services/api"

const neighborhoods = [
  "Centro",
  "Getúlio_Vargas",
  "Cirurgia",
  "Pereira_Lobo",
  "Suíssa",
  "Salgado_Filho",
  "Treze_de_Julho",
  "Dezoito_do_Forte",
  "Palestina",
  "Santo_Antônio",
  "Industrial",
  "Santos_Dumont",
  "José_Conrado_de_Araújo",
  "Novo_Paraíso",
  "América",
  "Siqueira_Campos",
  "Soledade",
  "Lamarão",
  "Cidade_Nova",
  "Japãozinho",
  "Porto_Dantas",
  "Bugio",
  "Jardim_Centenário",
  "Olaria",
  "Capucho",
  "Jabotiana",
  "Ponto_Novo",
  "Luzia",
  "Grageru",
  "Jardins",
  "Inácio_Barbosa",
  "São_Conrado",
  "Farolândia",
  "Coroa_do_Meio",
  "Aeroporto",
  "Atalaia",
  "Santa_Maria",
  "Zona_de_Expansão",
  "São_José",
]

export function CreateOccurrenceModal({ isOpen, onClose, handleCreateOccurrence }) {
  const [dateTime, setDateTime] = useState("")
  const [pilotId, setPilotId] = useState("")
  const [address, setAddress] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [streetDirection, setStreetDirection] = useState("")
  const [type, setType] = useState("")
  const [zone, setZone] = useState("")
  const [quantity, setQuantity] = useState("")
  const [videoStart, setVideoStart] = useState(null)
  const [videoName, setVideoName] = useState("")
  const [latitudeCoordinate, setLatitudeCoordinate] = useState("")
  const [longitudeCoordinate, setLongitudeCoordinate] = useState("")
  const [description, setDescription] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [pilots, setPilots] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imageName, setImageName] = useState("")
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState("")

  // Função para buscar os pilotos
  const fetchPilots = async () => {
    try {
      const response = await api.get("/pilots")
      setPilots(response.data.data)
    } catch (error) {
      console.log(error.message)
    }
  }

  // Efeito para buscar os pilotos ao carregar o modal
  useEffect(() => {
    fetchPilots()
  }, [])

  // Efeito para buscar o endereço quando o CEP for alterado
  useEffect(() => {
    const fetchAddress = async () => {
      if (zipCode.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
          const data = await response.json()

          if (!data.erro) {
            setAddress(`${data.logradouro}`)
            setNeighborhood(data.bairro)
          } else {
            alert("CEP não encontrado.")
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error)
        }
      }
    }

    fetchAddress()
  }, [zipCode])

  const handleVideoChange = (e) => {
    setUploadError("")
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Verificar tamanho do arquivo (limite de 100MB como exemplo)
      if (file.size > 600 * 1024 * 1024) {
        setUploadError("O arquivo é muito grande. O tamanho máximo é 600MB.")
        return
      }

      setVideoStart(file)
      setVideoName(file.name)
    }
  }

  const handleImageChange = (e) => {
    setImageUploadError("")
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Verificar tamanho do arquivo (limite de 10MB como exemplo)
      if (file.size > 10 * 1024 * 1024) {
        setImageUploadError("O arquivo é muito grande. O tamanho máximo é 10MB.")
        return
      }

      setImageFile(file)
      setImageName(file.name)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Só inicia o upload quando o formulário é enviado
    if (videoStart) {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadError("")
    }

    try {
      let videoUrl = ""

      if (videoStart) {
        const presignedUrlResponse = await api.get("/air-occurrences/geturl", {
          params: {
            filename: videoStart.name, // Nome do arquivo
            contentType: videoStart.type, // Tipo do arquivo
            video: true
          },
        })
        const { url, key } = presignedUrlResponse.data

        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: videoStart,
          headers: {
            "Content-Type": videoStart.type || "video/mp4", // Fallback para 'video/mp4'
          },
        })

        console.log("Resposta do upload:", uploadResponse)

        if (uploadResponse.ok) {
          await api.post("/air-occurrences/setvideopublic", { key })
        } else {
          throw new Error("Erro ao fazer upload do vídeo.")
        }

        // Obter a URL pública do vídeo
        videoUrl = key
      }

      let imageUrl = ""

      if (imageFile) {
        setIsImageUploading(true)
        setImageUploadProgress(0)
        setImageUploadError("")

        const imagePresignedUrlResponse = await api.get("/air-occurrences/geturl", {
          params: {
            filename: imageFile.name,
            contentType: imageFile.type,
          },
        })
        const { url: imagePresignedUrl, key: imageKey } = imagePresignedUrlResponse.data

        const imageUploadResponse = await fetch(imagePresignedUrl, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type || "image/jpeg",
          },
        })

        console.log("Resposta do upload da imagem:", imageUploadResponse)

        if (imageUploadResponse.ok) {
          await api.post("/air-occurrences/setvideopublic", { key: imageKey })
          imageUrl = imageKey
        } else {
          throw new Error("Erro ao fazer upload da imagem.")
        }
      }

      // Criar FormData para enviar todos os dados do formulário
      const formData = new FormData()
      formData.append("date_time", dateTime)
      formData.append("pilot_id", pilotId.match(/(\d+)$/)[0])
      formData.append("address", address)
      formData.append("zip_code", zipCode)
      formData.append("street_direction", streetDirection)
      formData.append("type", type)
      formData.append("zone", zone)
      formData.append("quantity", quantity)
      formData.append("status", "EmAnalise")
      formData.append("latitude_coordinate", latitudeCoordinate.replace(/\s+/g, ""))
      formData.append("longitude_coordinate", longitudeCoordinate.replace(/\s+/g, ""))
      formData.append("description", description)
      formData.append("neighborhood", neighborhood)

      // Adicionar a URL do vídeo ao FormData, se existir
      if (videoUrl) {
        formData.append("video_url", videoUrl)
      }

      if (imageUrl) {
        formData.append("photo_url", imageUrl)
      }

      // Enviar todos os dados de uma vez com monitoramento de progresso
      const response = await api.post("/air-occurrences", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      handleCreateOccurrence(response.data)
      onClose()
    } catch (error) {
      setIsUploading(false)
      console.error("Erro ao enviar formulário:", error)
      setUploadError("Erro ao enviar os dados. Verifique sua conexão e tente novamente.")
    }
  }

  // Função para cancelar o upload
  const cancelUpload = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setUploadError("")
    setIsImageUploading(false)
    setImageUploadProgress(0)
    setImageUploadError("")
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-4xl p-6 bg-white rounded-2xl shadow-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">Informações da Ocorrência</Dialog.Title>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200"
              onClick={onClose}
              disabled={isUploading || isImageUploading}
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateTime">Data e Hora</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div>
              <Label htmlFor="pilotId">Piloto</Label>
              <Select onValueChange={setPilotId} value={pilotId} disabled={isUploading || isImageUploading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Piloto" />
                </SelectTrigger>
                <SelectContent>
                  {pilots.map((pilot) => (
                    <SelectItem key={pilot.id} value={`${pilot.name} - ${pilot.id}`}>
                      {pilot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1">
              <Label htmlFor="zipCode">CEP da Rua</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="CEP"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
                className="w-32"
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                type="text"
                placeholder="Endereço Completo"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Select onValueChange={setNeighborhood} value={neighborhood} disabled={isUploading || isImageUploading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o bairro" />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="streetDirection">Direção da Rua</Label>
              <Select
                onValueChange={setStreetDirection}
                value={streetDirection}
                disabled={isUploading || isImageUploading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a direção da rua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nordeste">Nordeste</SelectItem>
                  <SelectItem value="Sudoeste">Sudoeste</SelectItem>
                  <SelectItem value="Sudeste">Sudeste</SelectItem>
                  <SelectItem value="Noroeste">Noroeste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo de Ocorrência</Label>
              <Select onValueChange={setType} value={type} disabled={isUploading || isImageUploading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione Tipo de Ocorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BuracoNaRua">Buraco na Rua</SelectItem>
                  <SelectItem value="FioEmaranhado">Fio Emaranhado</SelectItem>
                  <SelectItem value="CalcadaIrregular">Calçada Irregular</SelectItem>
                  <SelectItem value="MeioFio">Meio Fio Danificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zone">Zona</Label>
              <Select onValueChange={setZone} value={zone} disabled={isUploading || isImageUploading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a Zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Norte">Norte</SelectItem>
                  <SelectItem value="Sul">Sul</SelectItem>
                  <SelectItem value="Leste">Leste</SelectItem>
                  <SelectItem value="Oeste">Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Quantidade"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div>
              <Label htmlFor="videoStart">Vídeo Inicial</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="videoStart"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={isUploading || isImageUploading}
                  className={uploadError ? "border-red-500" : ""}
                />

                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

                {videoName && !isUploading && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-green-600">Vídeo selecionado: {videoName}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault() // Previne propagação do evento
                        e.stopPropagation() // Garante que o evento não se propague
                        setVideoStart(null)
                        setVideoName("")
                        // Resetar o input de arquivo
                        const fileInput = document.getElementById("videoStart")
                        if (fileInput) {
                          fileInput.value = ""
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Enviando vídeo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#5E56FF] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs mt-1"
                      onClick={cancelUpload}
                    >
                      Cancelar upload
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="imageFile">Imagem</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading || isImageUploading}
                  className={imageUploadError ? "border-red-500" : ""}
                />

                {imageUploadError && <p className="text-xs text-red-500">{imageUploadError}</p>}

                {imageName && !isImageUploading && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-green-600">Imagem selecionada: {imageName}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setImageFile(null)
                        setImageName("")
                        // Resetar o input de arquivo
                        const fileInput = document.getElementById("imageFile")
                        if (fileInput) {
                          fileInput.value = ""
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                )}

                {isImageUploading && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Enviando imagem...</span>
                      <span>{imageUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#5E56FF] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${imageUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Latitude</Label>
              <Input
                type="text"
                placeholder="Latitude"
                required
                value={latitudeCoordinate}
                onChange={(e) => setLatitudeCoordinate(e.target.value)}
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="text"
                placeholder="Longitude"
                required
                value={longitudeCoordinate}
                onChange={(e) => setLongitudeCoordinate(e.target.value)}
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Descrição da Ocorrência</Label>
              <Textarea
                id="description"
                placeholder="Descrição da Ocorrência"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24"
                disabled={isUploading || isImageUploading}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={onClose} disabled={isUploading || isImageUploading}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#5E56FF]" disabled={isUploading || isImageUploading}>
                {isUploading
                  ? `Enviando vídeo (${uploadProgress}%)`
                  : isImageUploading
                    ? `Enviando imagem (${imageUploadProgress}%)`
                    : "Salvar"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

