"use client"

// React e bibliotecas externas
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MapPin, MinusIcon, PlusIcon, Upload, User } from "lucide-react";

// Hooks customizados
import { useAuth } from "@/hooks/auth";

// Componentes globais
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Serviços e utilitários
import { api } from "@/services/api";


const neighborhoods = [
  "Aruana",
  "Centro",
  "Getulio_Vargas",
  "Cirurgia",
  "Pereira_Lobo",
  "Suissa",
  "Salgado_Filho",
  "Treze_de_Julho",
  "Dezoito_do_Forte",
  "Palestina",
  "Santo_Antonio",
  "Industrial",
  "Santos_Dumont",
  "Jose_Conrado_de_Araujo",
  "Novo_Paraiso",
  "America",
  "Siqueira_Campos",
  "Soledade",
  "Lamarao",
  "Cidade_Nova",
  "Japaozinho",
  "Porto_Dantas",
  "Bugio",
  "Jardim_Centenario",
  "Olaria",
  "Capucho",
  "Jabotiana",
  "Ponto_Novo",
  "Luzia",
  "Grageru",
  "Jardins",
  "Inacio_Barbosa",
  "Sao_Conrado",
  "Farolandia",
  "Coroa_do_Meio",
  "Aeroporto",
  "Atalaia",
  "Santa_Maria",
  "Zona_de_Expansao",
  "Sao_Jose",
]

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM"

// Improved function to ensure consistent date format
const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Modificar o useState do dateTime para inicializar com a data atual
export function CreateOccurrenceTPage() {
  const [dateTime, setDateTime] = useState(getCurrentDateTime())
  const [pilotId, setPilotId] = useState("")
  const [pilotName, setPilotName] = useState("")
  const [sectors, setSectors] = useState([])
  const [selectedSector, setSelectedSector] = useState("")
  const [occurrenceTypes, setOccurrenceTypes] = useState([])
  const [address, setAddress] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [zone, setZone] = useState("")
  const [quantity, setQuantity] = useState("")
  const [latitudeCoordinate, setLatitudeCoordinate] = useState("")
  const [longitudeCoordinate, setLongitudeCoordinate] = useState("")
  const [description, setDescription] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [pilots, setPilots] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imageName, setImageName] = useState("")
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { signOut, user } = useAuth()
  const [formIsValid, setFormIsValid] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [uploadTimeout, setUploadTimeout] = useState(null) // Para controlar timeout do upload
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false) // Estado para controlar o carregamento das coordenadas
  const [isLoadingPilot, setIsLoadingPilot] = useState(true) // Estado para controlar o carregamento do piloto
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false)

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
        setPilotName(pilot.name)
        setPilotId(`${pilot.name} - ${pilot.id}`)
        console.log("PilotId set to:", `${pilot.name} - ${pilot.id}`)
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
  const fetchOccurrenceTypes = useCallback(async (sectorId) => {
    if (!sectorId) return

    try {
      const response = await api.get(`/occurrence-types?sector=${sectorId}`)
      setOccurrenceTypes(response.data.data)
    } catch (error) {
      console.log(error.message)
    }
  }, [])

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
  useEffect(() => {
    if (selectedSector) {
      const sectorId = selectedSector.split(" - ")[1]
      fetchOccurrenceTypes(sectorId)
    } else {
      setOccurrenceTypes([])
    }
  }, [selectedSector, fetchOccurrenceTypes])

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

  // Função para obter a localização atual do usuário
  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setSubmitError("Seu navegador não suporta geolocalização.")
      return
    }

    setIsLoadingCoordinates(true)
    setIsLoadingGeolocation(true)
    setSubmitError("")

    try {
      // Obter as coordenadas do usuário
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // Aumentado para 15 segundos
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      console.log(`Localização atual: Latitude: ${latitude}, Longitude: ${longitude}`)

      // Atualizar os campos de coordenadas
      setLatitudeCoordinate(latitude.toString())
      setLongitudeCoordinate(longitude.toString())

      // Usar geocodificação reversa para obter o endereço
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        console.log("Dados de geocodificação recebidos:", data.results[0])

        const result = data.results[0]
        const addressComponents = result.address_components

        // Extrair informações do endereço
        const getComponent = (types) => {
          const component = addressComponents.find((comp) => types.some((type) => comp.types.includes(type)))
          return component ? component.long_name : ""
        }

        // Obter componentes do endereço
        const streetNumber = getComponent(["street_number"])
        const route = getComponent(["route"])
        const sublocality = getComponent(["sublocality", "sublocality_level_1"])
        const neighborhood = getComponent(["neighborhood"])
        const postalCode = getComponent(["postal_code"])

        // Usar o bairro encontrado (sublocality ou neighborhood)
        const foundNeighborhood = sublocality || neighborhood

        console.log("Componentes encontrados:", {
          rua: route,
          numero: streetNumber,
          bairro: foundNeighborhood,
          cep: postalCode,
        })

        // Formatar o endereço
        const formattedAddress = route + (streetNumber ? `, ${streetNumber}` : "")
        setAddress(formattedAddress)

        // Processar o CEP
        if (postalCode) {
          const cleanZip = postalCode.replace(/\D/g, "")
          setZipCode(cleanZip)
        }

        // Encontrar o bairro correspondente na lista de bairros
        if (foundNeighborhood) {
          // Normalizar o nome do bairro (remover acentos, converter para minúsculas)
          const normalizeText = (text) => {
            return text
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/\s+/g, "_")
          }

          const normalizedFoundNeighborhood = normalizeText(foundNeighborhood)

          // Procurar correspondência na lista de bairros
          const matchedNeighborhood = neighborhoods.find((n) => {
            const normalizedListNeighborhood = normalizeText(n.replace(/_/g, " "))
            return (
              normalizedListNeighborhood.includes(normalizedFoundNeighborhood) ||
              normalizedFoundNeighborhood.includes(normalizedListNeighborhood)
            )
          })

          console.log("Buscando correspondência para:", normalizedFoundNeighborhood)
          console.log("Bairro correspondente encontrado:", matchedNeighborhood)

          if (matchedNeighborhood) {
            setNeighborhood(matchedNeighborhood)
          } else {
            // Se não encontrar correspondência exata, tenta encontrar o mais próximo
            // Isso é uma solução simplificada, pode ser melhorada
            const closestMatch = neighborhoods.reduce((closest, current) => {
              const normalizedCurrent = normalizeText(current.replace(/_/g, " "))
              if (
                normalizedCurrent.includes(normalizedFoundNeighborhood.substring(0, 5)) ||
                normalizedFoundNeighborhood.includes(normalizedCurrent.substring(0, 5))
              ) {
                return current
              }
              return closest
            }, null)

            if (closestMatch) {
              setNeighborhood(closestMatch)
            } else {
              // Se ainda não encontrar, mostra uma mensagem para o usuário selecionar manualmente
              setSubmitError(
                "Não foi possível identificar o bairro automaticamente. Por favor, selecione o bairro manualmente.",
              )
            }
          }
        }

        // Determinar a zona baseada nas coordenadas para Aracaju
        // Coordenadas aproximadas do centro de Aracaju: -10.9472, -37.0731

        // Lógica simplificada para determinar a zona em Aracaju
        if (latitude < -10.9472 && longitude < -37.0731) {
          setZone("Oeste")
        } else if (latitude < -10.9472 && longitude >= -37.0731) {
          setZone("Sul")
        } else if (latitude >= -10.9472 && longitude < -37.0731) {
          setZone("Norte")
        } else {
          setZone("Leste")
        }

        console.log("Endereço obtido com sucesso da localização atual")
      } else {
        console.error("Erro na geocodificação reversa:", data.status)
        setSubmitError(`Não foi possível obter o endereço para esta localização. Erro: ${data.status}`)
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error)

      let errorMessage = "Erro ao obter sua localização."

      // Mensagens de erro mais específicas
      if (error.code === 1) {
        errorMessage =
          "Permissão de localização negada. Por favor, permita o acesso à sua localização nas configurações do seu navegador."
      } else if (error.code === 2) {
        errorMessage =
          "Localização indisponível. Isso pode ocorrer por vários motivos: GPS desligado, sinal fraco ou você está em um ambiente interno. Tente novamente em um local aberto ou insira o endereço manualmente."
      } else if (error.code === 3) {
        errorMessage = "Tempo esgotado ao tentar obter localização. Verifique se o GPS está ativado e tente novamente."
      }

      setSubmitError(errorMessage)

      // Sugerir ao usuário que insira o endereço manualmente
      if (error.code === 2) {
        // Focar no campo de CEP para incentivar o preenchimento manual
        setTimeout(() => {
          const zipCodeInput = document.getElementById("zipCode")
          if (zipCodeInput) {
            zipCodeInput.focus()
          }
        }, 500)
      }
    } finally {
      setIsLoadingCoordinates(false)
      setIsLoadingGeolocation(false)
    }
  }, [GOOGLE_MAPS_API_KEY, neighborhoods])

  useEffect(() => {
    const fetchAddress = async () => {
      if (zipCode.length === 8) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&region=br&key=${GOOGLE_MAPS_API_KEY}`,
          )
          const data = await response.json()

          if (data.status === "OK") {
            const result = data.results[0]
            const components = result.address_components

            const getComponent = (types) =>
              components.find((comp) => types.every((t) => comp.types.includes(t)))?.long_name || ""

            // Buscar logradouro (rua)
            let logradouro = getComponent(["route"])

            // Somente se 'route' não existir, tentar um fallback seguro
            if (!logradouro) {
              const hasStreetInFormatted = /^R\.?\s|Rua\s|Av\.?\s|Avenida\s/i.test(result.formatted_address)
              if (hasStreetInFormatted) {
                logradouro = result.formatted_address.split(",")[0]
              }
            }

            // Bairro
            const bairro = getComponent(["sublocality", "sublocality_level_1"])

            setAddress(logradouro)

            // Process the neighborhood if found
            if (bairro) {
              // Find matching neighborhood in our predefined list
              const normalizeText = (text) => {
                return text
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/\s+/g, "_")
              }

              const normalizedBairro = normalizeText(bairro)

              // Find the matching neighborhood in our list
              const matchedNeighborhood = neighborhoods.find((n) => {
                const normalizedListNeighborhood = normalizeText(n.replace(/_/g, " "))
                return (
                  normalizedListNeighborhood.includes(normalizedBairro) ||
                  normalizedBairro.includes(normalizedListNeighborhood)
                )
              })

              if (matchedNeighborhood) {
                setNeighborhood(matchedNeighborhood)
              }
            }
          } else {
            alert("CEP não encontrado.")
          }
        } catch (error) {
          console.error("Erro ao buscar CEP no Google Maps:", error)
        }
      }
    }

    fetchAddress()
  }, [zipCode])

  // Modificar o useEffect para definir a data atual quando o componente é montado
  useEffect(() => {
    setDateTime(getCurrentDateTime())
  }, [])

  useEffect(() => {
    // Check if all required fields are filled and coordinates are valid
    const isValid =
      dateTime !== "" &&
      pilotId !== "" &&
      selectedSector !== "" &&
      address !== "" &&
      zipCode !== "" &&
      zone !== "" &&
      quantity !== "" &&
      latitudeCoordinate !== "" &&
      longitudeCoordinate !== "" &&
      description !== "" &&
      neighborhood !== "" &&
      isValidCoordinate(latitudeCoordinate) &&
      isValidCoordinate(longitudeCoordinate) &&
      imageFile !== null // Image is required

    setFormIsValid(isValid)
  }, [
    dateTime,
    pilotId,
    selectedSector,
    address,
    zipCode,
    zone,
    quantity,
    latitudeCoordinate,
    longitudeCoordinate,
    description,
    neighborhood,
    imageFile, // Add imageFile to dependencies
  ])

  // Limpar o timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout)
      }
    }
  }, [uploadTimeout])

  const handleImageChange = (e) => {
    setImageUploadError("")
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Verificar tamanho do arquivo (limite de 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setImageUploadError("O arquivo é muito grande. O tamanho máximo é 10MB.")
        return
      }

      // Verificar se é uma imagem válida
      if (!file.type.startsWith("image/")) {
        setImageUploadError("Por favor, selecione um arquivo de imagem válido.")
        return
      }

      console.log("Imagem selecionada:", file.name, "Tamanho:", (file.size / 1024 / 1024).toFixed(2) + "MB")
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

  // Função para alternar o sinal da coordenada
  const toggleCoordinateSign = (coordinate, setCoordinate) => {
    if (!coordinate) return

    if (coordinate.startsWith("-")) {
      setCoordinate(coordinate.substring(1))
    } else {
      setCoordinate("-" + coordinate)
    }
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

  // Modificar o useEffect de validação do formulário

  // Função para redimensionar a imagem antes do upload (reduz o tamanho do arquivo)
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      // Se não for uma imagem, retorna o arquivo original
      if (!file || !file.type.startsWith("image/")) {
        resolve(file)
        return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          // Definir dimensões máximas
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200

          let width = img.width
          let height = img.height

          // Redimensionar mantendo a proporção
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width))
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height))
              height = MAX_HEIGHT
            }
          }

          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)

          // Converter para Blob com qualidade reduzida (0.8 = 80%)
          canvas.toBlob(
            (blob) => {
              // Criar um novo arquivo a partir do blob
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })

              console.log(
                "Imagem redimensionada:",
                "Original:",
                (file.size / 1024 / 1024).toFixed(2) + "MB",
                "Nova:",
                (resizedFile.size / 1024 / 1024).toFixed(2) + "MB",
              )

              resolve(resizedFile)
            },
            file.type,
            0.8,
          )
        }
        img.onerror = (error) => {
          console.error("Erro ao carregar imagem:", error)
          resolve(file) // Em caso de erro, usa o arquivo original
        }
      }
      reader.onerror = (error) => {
        console.error("Erro ao ler arquivo:", error)
        reject(error)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation() // Added to ensure event propagation is stopped

    // Clear any previous errors
    setSubmitError("")
    setIsSubmitting(true)
    setIsImageUploading(false) // Reset upload state
    setImageUploadProgress(0)

    // Check if image is provided
    if (!imageFile) {
      setSubmitError("É necessário anexar uma imagem para cadastrar a ocorrência.")
      setIsSubmitting(false)
      return
    }

    // Configurar um timeout para cancelar o upload se demorar muito
    if (uploadTimeout) {
      clearTimeout(uploadTimeout)
    }

    const timeoutId = setTimeout(() => {
      if (isImageUploading || isSubmitting) {
        setSubmitError(
          "O upload está demorando muito. Por favor, tente novamente com uma imagem menor ou verifique sua conexão.",
        )
        setIsImageUploading(false)
        setIsSubmitting(false)
      }
    }, 60000) // 60 segundos de timeout

    setUploadTimeout(timeoutId)

    // Log form data for debugging
    console.log("Form submission started")
    console.log("Data no momento do envio:", dateTime)
    console.log("Image file:", imageFile ? imageFile.name : "No image")

    try {
      // Extract pilot ID correctly
      let pilotIdValue = ""
      if (pilotId) {
        const match = pilotId.match(/(\d+)$/)
        pilotIdValue = match ? match[0] : ""
      }

      // Extract sector ID correctly
      let sectorIdValue = ""
      if (selectedSector) {
        const match = selectedSector.match(/(\d+)$/)
        sectorIdValue = match ? match[0] : ""
      }

      if (!pilotIdValue) {
        throw new Error("ID do piloto não encontrado")
      }

      const formattedZip = zipCode.replace(/^(\d{5})(\d{3})$/, "$1-$2")

      // Create FormData object
      const formData = new FormData()

      // Append all form fields
      formData.append("date_time", dateTime)
      formData.append("pilot_id", pilotIdValue)
      formData.append("sector_id", sectorIdValue)
      formData.append("address", address)
      formData.append("zip_code", formattedZip)
      formData.append("zone", zone)
      formData.append("quantity", quantity)
      formData.append("status", "EmAnalise")
      formData.append("latitude_coordinate", latitudeCoordinate)
      formData.append("longitude_coordinate", longitudeCoordinate)
      formData.append("description", description)
      formData.append("neighborhood", neighborhood)

      // Processar a imagem antes do upload
      try {
        setIsImageUploading(true)
        console.log("Redimensionando imagem antes do upload...")

        // Redimensionar a imagem para reduzir o tamanho
        const resizedImage = await resizeImage(imageFile)

        // Adicionar a imagem redimensionada ao FormData
        formData.append("photo_start", resizedImage)

        console.log("Imagem processada e pronta para upload")
      } catch (error) {
        console.error("Erro ao processar imagem:", error)
        // Se falhar o processamento, tenta enviar a imagem original
        formData.append("photo_start", imageFile)
      }

      console.log("FormData created, sending to API...")

      // Configurar timeout para a requisição
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 segundos

      // Enviar a requisição com tratamento de erros adequado
      const response = await api.post("/land-occurrences/web", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setImageUploadProgress(percentCompleted)
            console.log(`Upload progress: ${percentCompleted}%`)
          }
        },
      })

      clearTimeout(timeoutId) // Limpar o timeout da requisição

      console.log("API response:", response.data)

      // Show success message
      setShowSuccessMessage(true)

      // Reset form
      resetForm()

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)

      // Mensagem de erro mais amigável baseada no tipo de erro
      let errorMessage = "Erro ao enviar o formulário. Tente novamente."

      if (error.name === "AbortError") {
        errorMessage = "A requisição demorou muito tempo. Verifique sua conexão ou tente com uma imagem menor."
      } else if (error.response) {
        // Erro da API
        errorMessage = `Erro do servidor: ${error.response.status} - ${error.response.data?.message || "Erro desconhecido"}`
      } else if (error.message) {
        errorMessage = error.message
      }

      setSubmitError(errorMessage)
    } finally {
      // Garantir que todos os estados de carregamento sejam resetados
      setIsSubmitting(false)
      setIsImageUploading(false)
      setImageUploadProgress(0)

      // Limpar o timeout
      if (uploadTimeout) {
        clearTimeout(uploadTimeout)
        setUploadTimeout(null)
      }
    }
  }

  // Função para resetar o formulário
  const resetForm = useCallback(() => {
    // Primeiro, atualize a data atual
    const newDateTime = getCurrentDateTime()
    console.log("Nova data após reset:", newDateTime)

    // Resetar todos os campos do formulário
    setDateTime(newDateTime)
    // Não resetar as informações do piloto
    // setPilotId("")
    // setPilotName("")
    setSelectedSector("")
    setOccurrenceTypes([])
    setAddress("")
    setZipCode("")
    setZone("")
    setQuantity("")
    setLatitudeCoordinate("")
    setLongitudeCoordinate("")
    setDescription("")
    setNeighborhood("")
    setImageFile(null)
    setImageName("")
    setImageUploadProgress(0)
    setIsImageUploading(false)
    setImageUploadError("")
    setIsSubmitting(false)
    setSubmitError("")

    // Resetar os inputs de arquivo
    const imageInput = document.getElementById("imageFile")
    if (imageInput) imageInput.value = ""

    // Importante: definir um timeout para garantir que o estado seja atualizado
    setTimeout(() => {
      setDateTime(getCurrentDateTime())
      setIsSubmitting(false)
    }, 100)
  }, [])

  // Função para cancelar o upload
  const cancelUpload = () => {
    setIsImageUploading(false)
    setImageUploadProgress(0)
    setImageUploadError("")
    setIsSubmitting(false)

    if (uploadTimeout) {
      clearTimeout(uploadTimeout)
      setUploadTimeout(null)
    }
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

  // Adicionar este efeito para atualizar a data a cada minuto
  useEffect(() => {
    // Atualizar a data imediatamente
    setDateTime(getCurrentDateTime())

    // Configurar um intervalo para atualizar a data a cada minuto
    const interval = setInterval(() => {
      setDateTime(getCurrentDateTime())
    }, 60000) // 60000 ms = 1 minuto

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [])

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

      {/* Display submission errors */}
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
        <Button variant="ghost" className="mr-4" onClick={handleSignOut} disabled={isImageUploading || isSubmitting}>
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
              {/* Modificar o input de data/hora para ser somente leitura */}
              <Input
                id="dateTime"
                type="datetime-local"
                required
                value={dateTime}
                readOnly
                className="mt-1 cursor-not-allowed bg-gray-100"
                disabled={isImageUploading || isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="pilotId">Piloto</Label>
              <div className="relative mt-1">
                <div className="flex items-center p-2 border rounded-md bg-gray-100 cursor-not-allowed">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  {isLoadingPilot ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-t-[#5E56FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-500">Carregando piloto...</span>
                    </div>
                  ) : (
                    <span>{pilotName || "Piloto não encontrado"}</span>
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
                disabled={isImageUploading || isSubmitting}
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
                inputMode="numeric" // Better for mobile numeric input
                placeholder="CEP"
                required
                value={zipCode.length > 5 ? `${zipCode.slice(0, 5)}-${zipCode.slice(5)}` : zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 9) {
                    const formattedValue = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value
                    setZipCode(value)
                  }
                }}
                maxLength={9}
                className="mt-1"
                disabled={isImageUploading || isSubmitting}
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
                disabled={isImageUploading || isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Select onValueChange={setNeighborhood} value={neighborhood} disabled={isImageUploading || isSubmitting}>
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
              <Label htmlFor="zone">Zona</Label>
              <Select onValueChange={setZone} value={zone} disabled={isImageUploading || isSubmitting}>
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
                inputMode="numeric" // Better for mobile numeric input
                placeholder="Quantidade"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
                disabled={isImageUploading || isSubmitting}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="imageFile">Imagem (obrigatório)</Label>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isImageUploading || isSubmitting}
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
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={cancelUpload}>
                      Cancelar upload
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-red-500 mt-1">A imagem é obrigatória para o envio da ocorrência</p>
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
                    disabled={isImageUploading || isSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2 h-10 w-10"
                  onClick={() => toggleCoordinateSign(latitudeCoordinate, setLatitudeCoordinate)}
                  disabled={isImageUploading || isSubmitting}
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
                    disabled={isImageUploading || isSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2 h-10 w-10"
                  onClick={() => toggleCoordinateSign(longitudeCoordinate, setLongitudeCoordinate)}
                  disabled={isImageUploading || isSubmitting}
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

            {/* Botão para buscar coordenadas automaticamente */}
            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={fetchCoordinates}
                disabled={
                  isImageUploading || isSubmitting || isLoadingCoordinates || !address || !zipCode || !neighborhood
                }
              >
                <MapPin className="h-4 w-4" />
                {isLoadingCoordinates ? "Buscando coordenadas..." : "Obter coordenadas do endereço"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Preencha o endereço, CEP e bairro para buscar as coordenadas automaticamente
              </p>
            </div>

            {/* Botão para usar localização atual */}
            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                onClick={getUserLocation}
                disabled={isImageUploading || isSubmitting || isLoadingCoordinates || isLoadingGeolocation}
              >
                <MapPin className="h-4 w-4 text-blue-600" />
                {isLoadingGeolocation ? "Obtendo localização..." : "Usar minha localização atual"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Usa o GPS do seu dispositivo para preencher automaticamente o endereço
              </p>
            </div>

            {/* Adicione este botão logo após o botão "Usar minha localização atual" */}
            <div className="md:col-span-2 mt-2">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Problemas com a localização?</h4>
                <p className="text-xs text-blue-700 mb-2">
                  Se não for possível obter sua localização atual, você pode:
                </p>
                <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
                  <li>Verificar se o GPS do seu dispositivo está ativado</li>
                  <li>Permitir o acesso à localização nas configurações do navegador</li>
                  <li>Tentar em um ambiente externo (o sinal GPS pode ser fraco em ambientes internos)</li>
                  <li>Inserir o CEP manualmente e deixar o sistema preencher o endereço</li>
                </ul>
              </div>
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
                disabled={isImageUploading || isSubmitting}
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              {!formIsValid && <p className="text-red-500 text-sm">Todos os campos são obrigatórios.</p>}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  disabled={isImageUploading || isSubmitting}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#5E56FF] hover:bg-[#4A43E2]"
                  disabled={isImageUploading || isSubmitting || !formIsValid}
                >
                  {isImageUploading ? (
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
