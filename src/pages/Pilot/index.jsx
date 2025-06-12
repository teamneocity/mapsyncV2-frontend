"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/auth"
import { api } from "@/services/api"
// Import the required icons at the top of the file
import { ArrowLeft, MapPin, MinusIcon, PlusIcon, Upload } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

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

// Add the Google Maps API key constant after the neighborhoods array
const GOOGLE_MAPS_API_KEY = "AIzaSyCDmsBgRuI3pL4w4EJiclPD7kK4Ff9_OzQ"

// Adicionar esta função para formatar a data atual no formato ISO
const getCurrentDateTime = () => {
  const now = new Date()
  return now.toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 16)
}

// Modificar o useState do dateTime para inicializar com a data atual

export function CreateOccurrencePage() {
  const [pilotId, setPilotId] = useState("")
  const [address, setAddress] = useState("")
  const [dateTime, setDateTime] = useState(getCurrentDateTime())
  const [zipCode, setZipCode] = useState("")
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { signOut } = useAuth()
  const [formIsValid, setFormIsValid] = useState(false)
  // Add isLoadingCoordinates state and submitError state in the CreateOccurrencePage component
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [sectors, setSectors] = useState([])
  const [selectedSector, setSelectedSector] = useState("")
  const [occurrenceTypes, setOccurrenceTypes] = useState([])
  const [isLoadingPilot, setIsLoadingPilot] = useState(true)
  const { user } = useAuth()

  // Função para buscar os pilotos
  const fetchPilots = useCallback(async () => {
    try {
      const response = await api.get("/pilots")
      setPilots(response.data.data)
    } catch (error) {
      console.log(error.message)
    }
  }, [])

  // Função para buscar o piloto pelo ID do usuário
  const fetchPilotByUserId = useCallback(async (userId) => {
    if (!userId) return

    setIsLoadingPilot(true)

    try {
      const response = await api.get(`/pilots/${userId}`)
      if (response.data.success && response.data.data) {
        const pilot = response.data.data
        console.log("Pilot data retrieved:", pilot)
        setPilotId(`${pilot.name} - ${pilot.id}`)
      }
    } catch (error) {
      console.log("Erro ao buscar piloto pelo usuário:", error.message)
    } finally {
      setIsLoadingPilot(false)
    }
  }, [])

  // Função para buscar os setores
  const fetchSectors = useCallback(async () => {
    try {
      const response = await api.get("/sectors")
      setSectors(response.data.data)
    } catch (error) {
      console.log(error.message)
    }
  }, [])

  // Função para buscar os tipos de ocorrência baseado no setor selecionado
  // const fetchOccurrenceTypes = useCallback(async (sectorId) => {
  //   if (!sectorId) return

  //   try {
  //     const response = await api.get(`/occurrence-types?sector=${sectorId}`)
  //     setOccurrenceTypes(response.data.data)
  //   } catch (error) {
  //     console.log(error.message)
  //   }
  // }, [])

  // Efeito para buscar os pilotos ao carregar a página
  useEffect(() => {
    fetchPilots()

    // Se tiver um usuário logado, busca o piloto correspondente
    if (user?.id) {
      fetchPilotByUserId(user.id)
    }
  }, [fetchPilots, fetchPilotByUserId, user])

  // Efeito para buscar os setores ao carregar a página
  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  // Efeito para buscar os tipos de ocorrência quando um setor é selecionado
  // useEffect(() => {
  //   if (selectedSector) {
  //     const sectorId = selectedSector.split(" - ")[1]
  //     fetchOccurrenceTypes(sectorId)
  //   } else {
  //     setOccurrenceTypes([])
  //   }
  // }, [selectedSector, fetchOccurrenceTypes])

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

  useEffect(() => {
    setDateTime(getCurrentDateTime())
  }, [])

  const handleVideoChange = (e) => {
    setUploadError("")
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Verificar tamanho do arquivo (limite de 600MB)
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
      // Verificar tamanho do arquivo (limite de 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setImageUploadError("O arquivo é muito grande. O tamanho máximo é 10MB.")
        return
      }

      setImageFile(file)
      setImageName(file.name)
    }
  }

  // Adicionar estas funções de validação após a função handleImageChange

  const isValidCoordinate = (value) => {
    // Verifica se o formato é válido: apenas números, um ponto decimal e possivelmente um sinal negativo
    // Permite também apenas o símbolo negativo durante a digitação
    if (value === "-") return true
    const regex = /^-?\d+(\.\d+)?$/
    return regex.test(value)
  }

  const formatCoordinate = (value) => {
    // Substitui vírgulas por pontos e remove espaços
    return value.replace(/,/g, ".").replace(/\s+/g, "")
  }

  // Modificar os handlers de latitude e longitude
  const handleLatitudeChange = (e) => {
    // Permitir o símbolo negativo e números
    const value = e.target.value
    // Aceita dígitos, ponto decimal e símbolo negativo no início
    if (/^-?\d*\.?\d*$/.test(value) || value === "-" || value === "") {
      setLatitudeCoordinate(value)
    }
  }

  const handleLongitudeChange = (e) => {
    // Permitir o símbolo negativo e números
    const value = e.target.value
    // Aceita dígitos, ponto decimal e símbolo negativo no início
    if (/^-?\d*\.?\d*$/.test(value) || value === "-" || value === "") {
      setLongitudeCoordinate(value)
    }
  }

  // Add the fetchCoordinates function after the handleLongitudeChange function
  // Função para buscar coordenadas a partir do endereço
  const fetchCoordinates = useCallback(async () => {
    if (!address || !zipCode || !neighborhood) {
      setSubmitError("Preencha o endereço, CEP e bairro para buscar as coordenadas.")
      return
    }

    setIsLoadingCoordinates(true)
    setSubmitError("")

    try {
      // Formatar o endereço completo
      const formattedZip = zipCode.replace(/^(\d{5})(\d{3})$/, "$1-$2")
      const fullAddress = `${address}, ${neighborhood.replace(/_/g, " ")}, Aracaju, SE, ${formattedZip}`

      console.log("Buscando coordenadas para:", fullAddress)

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        console.log(`Coordenadas encontradas: Latitude: ${location.lat}, Longitude: ${location.lng}`)

        setLatitudeCoordinate(location.lat.toString())
        setLongitudeCoordinate(location.lng.toString())
      } else {
        console.error("Erro na geocodificação:", data.status)
        setSubmitError(`Não foi possível encontrar as coordenadas para este endereço. Erro: ${data.status}`)
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error)
      setSubmitError("Erro ao buscar coordenadas. Verifique sua conexão e tente novamente.")
    } finally {
      setIsLoadingCoordinates(false)
    }
  }, [address, zipCode, neighborhood])

  // Add the toggleCoordinateSign function after the fetchCoordinates function
  // Função para alternar o sinal da coordenada
  const toggleCoordinateSign = (coordinate, setCoordinate) => {
    if (!coordinate) return

    if (coordinate.startsWith("-")) {
      setCoordinate(coordinate.substring(1))
    } else {
      setCoordinate("-" + coordinate)
    }
  }

  useEffect(() => {
    // Check if all required fields are filled and coordinates are valid
    const isValid =
      dateTime !== "" &&
      pilotId !== "" &&
      selectedSector !== "" &&
      address !== "" &&
      zipCode !== "" &&
      type !== "" &&
      zone !== "" &&
      quantity !== "" &&
      latitudeCoordinate !== "" &&
      longitudeCoordinate !== "" &&
      description !== "" &&
      neighborhood !== "" &&
      isValidCoordinate(latitudeCoordinate) &&
      isValidCoordinate(longitudeCoordinate)

    setFormIsValid(isValid)
  }, [
    dateTime,
    pilotId,
    selectedSector,
    address,
    zipCode,
    type,
    zone,
    quantity,
    latitudeCoordinate,
    longitudeCoordinate,
    description,
    neighborhood,
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

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
            video: true,
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
      formData.append("sector_id", selectedSector ? selectedSector.split(" - ")[1] : "")
      formData.append("address", address)
      formData.append("zip_code", zipCode)
      formData.append("type", type)
      formData.append("zone", zone)
      formData.append("quantity", quantity)
      formData.append("status", "NaoVerificado")
      formData.append("latitude_coordinate", latitudeCoordinate)
      formData.append("longitude_coordinate", longitudeCoordinate)
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

      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true)

      // Resetar o formulário
      resetForm()

      // Esconder a mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    } catch (error) {
      setIsUploading(false)
      console.error("Erro ao enviar formulário:", error)
      setUploadError("Erro ao enviar os dados. Verifique sua conexão e tente novamente.")
      setIsSubmitting(false)
    }
  }

  // Função para resetar o formulário
  const resetForm = useCallback(() => {
    // Resetar todos os campos do formulário
    setDateTime(getCurrentDateTime()) // Ensure we get the current date/time again
    setPilotId("")
    setSelectedSector("")
    setOccurrenceTypes([])
    setAddress("")
    setZipCode("")
    setType("")
    setZone("")
    setQuantity("")
    setVideoStart(null)
    setVideoName("")
    setLatitudeCoordinate("")
    setLongitudeCoordinate("")
    setDescription("")
    setNeighborhood("")
    setUploadProgress(0)
    setIsUploading(false)
    setUploadError("")
    setImageFile(null)
    setImageName("")
    setImageUploadProgress(0)
    setIsImageUploading(false)
    setImageUploadError("")
    setIsSubmitting(false)

    // Resetar os inputs de arquivo
    const videoInput = document.getElementById("videoStart")
    if (videoInput) videoInput.value = ""

    const imageInput = document.getElementById("imageFile")
    if (imageInput) imageInput.value = ""
  }, [])

  // Função para cancelar o upload
  const cancelUpload = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setUploadError("")
    setIsImageUploading(false)
    setImageUploadProgress(0)
    setImageUploadError("")
    setIsSubmitting(false)
  }

  // Função para voltar à página anterior
  const handleGoBack = () => {
    window.history.back()
  }

  const handleSignOut = () => {
    signOut()
  }

  // Add this effect to update the date/time after successful form submission
  useEffect(() => {
    if (showSuccessMessage) {
      setDateTime(getCurrentDateTime())
    }
  }, [showSuccessMessage])

  return (
    <div className="container mx-auto py-8 px-4">
      {showSuccessMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-center justify-between"
          role="alert"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>Ocorrência cadastrada com sucesso! Você pode cadastrar uma nova ocorrência.</span>
          </div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-green-100 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8"
            onClick={() => setShowSuccessMessage(false)}
          >
            <span className="sr-only">Fechar</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{submitError}</span>
          <button
            type="button"
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSubmitError("")}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Fechar</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={handleSignOut}
          disabled={isUploading || isImageUploading || isSubmitting}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Sair
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar Nova Ocorrência</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informações da Ocorrência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="dateTime">Data e Hora</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                required
                value={dateTime}
                readOnly
                className="mt-1 cursor-not-allowed bg-gray-100"
                disabled={isUploading || isImageUploading || isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="pilotId">Piloto</Label>
              <div className="relative mt-1">
                <div className="flex items-center p-2 border rounded-md bg-gray-100 cursor-not-allowed">
                  {isLoadingPilot ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-t-[#5E56FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-500">Carregando piloto...</span>
                    </div>
                  ) : (
                    <span>{pilotId.split(" - ")[0] || "Piloto não encontrado"}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Piloto definido automaticamente pelo usuário logado</p>
            </div>
            <div>
              <Label htmlFor="sectorId">Setor</Label>
              <Select
                onValueChange={setSelectedSector}
                value={selectedSector}
                disabled={isUploading || isImageUploading || isSubmitting}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecione o Setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={`${sector.name} - ${sector.id}`}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zipCode">CEP da Rua</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="CEP"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
                className="mt-1"
                disabled={isUploading || isImageUploading || isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                type="text"
                placeholder="Endereço Completo"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                disabled={isUploading || isImageUploading || isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Select
                onValueChange={setNeighborhood}
                value={neighborhood}
                disabled={isUploading || isImageUploading || isSubmitting}
              >
                <SelectTrigger className="w-full mt-1">
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
              <Label htmlFor="type">Tipo de Ocorrência</Label>
              <Select onValueChange={setType} value={type} disabled={isUploading || isImageUploading || isSubmitting}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecione Tipo de Ocorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mapeamento">Mapeamento (Metragem)</SelectItem>
                  <SelectItem value="AnalisePavimentacao">Análise de Pavimentação</SelectItem>
                  <SelectItem value="VerificacaoDrenagem">Verificação de drenagem</SelectItem>
                  <SelectItem value="Inspecao">Inspeção</SelectItem>
                  <SelectItem value="Fiscalizacao">Fiscalização</SelectItem>
                  <SelectItem value="MidiaAscom">Mídia / Ascom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zone">Zona</Label>
              <Select onValueChange={setZone} value={zone} disabled={isUploading || isImageUploading || isSubmitting}>
                <SelectTrigger className="w-full mt-1">
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
                className="mt-1"
                disabled={isUploading || isImageUploading || isSubmitting}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="videoStart">
                Vídeo Inicial <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="videoStart"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    disabled={isUploading || isImageUploading || isSubmitting}
                    className={uploadError ? "border-red-500" : ""}
                    required
                  />
                  {videoName && !isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setVideoStart(null)
                        setVideoName("")
                        // Resetar o input de arquivo
                        const fileInput = document.getElementById("videoStart")
                        if (fileInput) {
                          fileInput.value = ""
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

                {videoName && !isUploading && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-600">Vídeo selecionado: {videoName}</p>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Enviando vídeo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#5E56FF] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-3 mt-2" onClick={cancelUpload}>
                      Cancelar upload
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="imageFile">
                Imagem <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading || isImageUploading || isSubmitting}
                    className={imageUploadError ? "border-red-500" : ""}
                    required
                  />
                  {imageName && !isImageUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3"
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
                      disabled={isSubmitting}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                {imageUploadError && <p className="text-xs text-red-500">{imageUploadError}</p>}

                {imageName && !isImageUploading && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-600">Imagem selecionada: {imageName}</p>
                  </div>
                )}

                {isImageUploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
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
              <div className="flex mt-1">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Ex: -10.311"
                    required
                    value={latitudeCoordinate}
                    onChange={handleLatitudeChange}
                    className={`${latitudeCoordinate && !isValidCoordinate(latitudeCoordinate) ? "border-red-500" : ""}`}
                    disabled={isUploading || isImageUploading || isSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2 h-10 w-10"
                  onClick={() => toggleCoordinateSign(latitudeCoordinate, setLatitudeCoordinate)}
                  disabled={isUploading || isImageUploading || isSubmitting}
                >
                  {latitudeCoordinate.startsWith("-") ? (
                    <PlusIcon className="h-4 w-4" />
                  ) : (
                    <MinusIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {latitudeCoordinate && !isValidCoordinate(latitudeCoordinate) && (
                <p className="text-xs text-red-500 mt-1">
                  Formato inválido. Use apenas números, ponto como separador decimal e símbolo negativo se necessário
                  (Ex: -10.311)
                </p>
              )}
            </div>
            <div>
              <Label>Longitude</Label>
              <div className="flex mt-1">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Ex: -37.048"
                    required
                    value={longitudeCoordinate}
                    onChange={handleLongitudeChange}
                    className={`${longitudeCoordinate && !isValidCoordinate(longitudeCoordinate) ? "border-red-500" : ""}`}
                    disabled={isUploading || isImageUploading || isSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2 h-10 w-10"
                  onClick={() => toggleCoordinateSign(longitudeCoordinate, setLongitudeCoordinate)}
                  disabled={isUploading || isImageUploading || isSubmitting}
                >
                  {longitudeCoordinate.startsWith("-") ? (
                    <PlusIcon className="h-4 w-4" />
                  ) : (
                    <MinusIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {longitudeCoordinate && !isValidCoordinate(longitudeCoordinate) && (
                <p className="text-xs text-red-500 mt-1">
                  Formato inválido. Use apenas números, ponto como separador decimal e símbolo negativo se necessário
                  (Ex: -37.048)
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={fetchCoordinates}
                disabled={
                  isUploading ||
                  isImageUploading ||
                  isSubmitting ||
                  isLoadingCoordinates ||
                  !address ||
                  !zipCode ||
                  !neighborhood
                }
              >
                <MapPin className="h-4 w-4" />
                {isLoadingCoordinates ? "Buscando coordenadas..." : "Obter coordenadas do endereço"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Preencha o endereço, CEP e bairro para buscar as coordenadas automaticamente
              </p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição da Ocorrência</Label>
              <Textarea
                id="description"
                placeholder="Descrição da Ocorrência"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-32 mt-1"
                disabled={isUploading || isImageUploading || isSubmitting}
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              {!formIsValid && <p className="text-red-500 text-sm">Todos os campos são obrigatórios.</p>}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  disabled={isUploading || isImageUploading || isSubmitting}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#5E56FF] hover:bg-[#4A43E2]"
                  disabled={isUploading || isImageUploading || isSubmitting || !formIsValid}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Enviando vídeo ({uploadProgress}%)
                    </span>
                  ) : isImageUploading ? (
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Enviando imagem ({imageUploadProgress}%)
                    </span>
                  ) : isSubmitting ? (
                    "Processando..."
                  ) : (
                    "Salvar Ocorrência"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
