import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { StatsCard } from "@/components/statsCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText, SquareArrowOutUpRight, Loader, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/services/api"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { LiveActionButton } from "@/components/live-action-button"
import { set } from "date-fns"
import { se } from "date-fns/locale"

mapboxgl.accessToken =
  "pk.eyJ1IjoiZWRtaXItcG9wY2l0eSIsImEiOiJjbWEzdWd2ZHQwMDdiMmlxNTk2NXNuMDlxIn0.1Z2150yRAbdMnQvS59H4eg"

export function RouteMap() {
  // State for pilots, selected pilot, date and route data
  const [pilots, setPilots] = useState([])
  const [selectedPilot, setSelectedPilot] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0] 
  })
  const [routeData, setRouteData] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [isMounted, setIsMounted] = useState(false)

  const [resolved, setResolved] = useState(0)
  const [pending, setPending] = useState(0)
  const [inAnalysis, setInAnalysis] = useState(0)
  const [discarded, setDiscarded] = useState(0)

  const [resolvedStatistics, setResolvedStatistics] = useState(0)
  const [pendingStatistics, setPendingStatistics] = useState(0)
  const [inAnalysisStatistics, setInAnalysisStatistics] = useState(0)
  const [discardedStatistics, setDiscardedStatistics] = useState(0)

  const [utilization, setUtilization] = useState(0)
  const [discardedPercentage, setDiscardedPercentage] = useState(0)

  // Map refs
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const routeLayer = useRef(null)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Fetch pilots on component mount
  useEffect(() => {
    const fetchPilots = async () => {
      try {
        const response = await api.get("/pilots")
        const responseData = response.data

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setPilots(responseData.data)
          if (responseData.data.length > 0) {
            setSelectedPilot(responseData.data[0])
          }
        } else {
          console.error("Unexpected response format:", responseData)
          setPilots([])
        }
      } catch (error) {
        console.error("Error fetching pilots:", error)
        setPilots([])
      }
    }

    fetchPilots()
  }, [])

  // Fetch route data when pilot or date changes
  useEffect(() => {
    if (selectedPilot) {
      fetchRouteData(selectedPilot.id, selectedDate)
    }
  }, [selectedPilot, selectedDate])


  const fetchRouteData = async (pilotId, date) => {
    try {
      setLoading(true)
      const response = await api.get(`/routes/${pilotId}/${date}`)
      const responseData = response.data

      const pilotStatsResponse = await api.get(`/routes/pilotstats/${pilotId}`)

      setResolved(pilotStatsResponse.data.resolved)
      setPending(pilotStatsResponse.data.pending)
      setInAnalysis(pilotStatsResponse.data.inReview)
      setDiscarded(pilotStatsResponse.data.excluded)

      setResolvedStatistics(pilotStatsResponse.data.variacoes.resolved)
      setPendingStatistics(pilotStatsResponse.data.variacoes.pending)
      setInAnalysisStatistics(pilotStatsResponse.data.variacoes.inReview)
      setDiscardedStatistics(pilotStatsResponse.data.variacoes.excluded)

      setUtilization(pilotStatsResponse.data.aproveitamento)
      setDiscardedPercentage(pilotStatsResponse.data.descartamento)

      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        setRouteData(responseData.data)
      } else if (Array.isArray(responseData)) {
        setRouteData(responseData)
      } else {
        console.error("Unexpected route data format:", responseData)
        setRouteData([])
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching route data:", error)
      setRouteData([])
      setLoading(false)
    }
  }

  const handlePilotChange = (pilotId) => {
    const pilot = pilots.find((p) => p.id.toString() === pilotId)
    setSelectedPilot(pilot)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  // Initialize Mapbox map - with a delay to ensure DOM is ready
  useEffect(() => {
    if (!isMounted) return

    // Use a small delay to ensure the DOM is fully rendered
    const initializeMapWithDelay = setTimeout(() => {
      if (!mapContainer.current) {
        console.error("Map container not found after delay")
        setMapError("Contêiner do mapa não encontrado. Por favor, recarregue a página.")
        setLoading(false)
        return
      }

      if (map.current) return // Map already initialized

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-37.062345, -10.944711], // [lng, lat]
          zoom: 15,
        })

        map.current.on("load", () => {
          setMapLoaded(true)
          setLoading(false)
        })

        map.current.on("error", (e) => {
          console.error("Map error:", e)
          setMapError(e.error?.message || "Erro ao carregar o mapa")
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      } catch (error) {
        console.error("Error initializing map:", error)
        setMapError(error.message || "Erro ao inicializar o mapa")
        setLoading(false)
      }
    }, 1500) // 500ms delay

    return () => {
      clearTimeout(initializeMapWithDelay)
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [isMounted])

  // Update map when route data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers and route
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    if (routeLayer.current) {
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
      }
      if (map.current.getSource("route")) {
        map.current.removeSource("route")
      }
      routeLayer.current = false
    }

    // If no route data, don't proceed further
    if (routeData.length === 0) {
      return
    }

    // Convert route data to coordinates array
    const coordinates = routeData.map((point) => [
      Number.parseFloat(point.longitude),
      Number.parseFloat(point.latitude),
    ])

    // Add markers for start, end, and pilot
    if (coordinates.length > 0) {
      // Start marker (green)
      const startMarker = new mapboxgl.Marker({ color: "#00FF00" })
        .setLngLat(coordinates[0])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Origem</h3>"))
        .addTo(map.current)
      markers.current.push(startMarker)

      // End marker (red)
      const endMarker = new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(coordinates[coordinates.length - 1])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Destino</h3>"))
        .addTo(map.current)
      markers.current.push(endMarker)

      // Pilot marker (blue)
      const pilotMarker = new mapboxgl.Marker({ color: "#0000FF" })
        .setLngLat(coordinates[coordinates.length - 1])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Piloto</h3>"))
        .addTo(map.current)
      markers.current.push(pilotMarker)

      // Add intermediate points as small yellow markers
      if (coordinates.length > 2) {
        for (let i = 1; i < coordinates.length - 1; i++) {
          const pointMarker = new mapboxgl.Marker({ color: "#FFFF00", scale: 0.7 })
            .setLngLat(coordinates[i])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Ponto ${i}</h3>`))
            .addTo(map.current)
          markers.current.push(pointMarker)
        }
      }

      try {
        // Add route line
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          },
        })

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#5E56FF",
            "line-width": 5,
            "line-opacity": 0.8,
          },
        })

        routeLayer.current = true

        // Fit map to bounds of the route
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        })
      } catch (error) {
        console.error("Error adding route to map:", error)
      }
    }
  }, [routeData, mapLoaded])

  return (
    <div className="flex h-screen flex-col sm:ml-[270px] font-inter">
      <Sidebar />

      <header className="hidden sm:flex sm:justify-between sm:items-center border-b py-5 px-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={selectedPilot?.id?.toString()} onValueChange={handlePilotChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione um piloto" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(pilots) &&
                  pilots.map((pilot) => (
                    <SelectItem key={pilot.id} value={pilot.id.toString()}>
                      {pilot.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500" size={20} />
            <input type="date" value={selectedDate} onChange={handleDateChange} className="border rounded-md p-2" />
          </div>
        </div>
        <LiveActionButton/>
      </header>

      <div className="h-full">
        <div className="bg-white p-4 shadow-md rounded-lg mx-6 my-5">
          <h1 className="text-xl font-bold">Mapa de Rotas</h1>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Origem</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span>Destino</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span>Pontos</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span>Piloto</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg mx-6">
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 animate-spin text-[#5E56FF]" />
              <p className="mt-2">Carregando mapa...</p>
            </div>
          </div>
        ) : mapError ? (
          <div className="flex items-center justify-center h-[400px] bg-red-50 rounded-lg mx-6">
            <div className="flex flex-col items-center text-red-500">
              <p className="mt-2">Erro ao carregar o mapa: {mapError}</p>
              <Button
                className="mt-4 bg-[#5E56FF] hover:bg-[#4A45CC] text-white"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        ) : (
          <div
            id="map-container"
            ref={mapContainer}
            className="mx-6 rounded-lg"
            style={{
              height: "400px",
              width: "calc(100% - 3rem)",
              position: "relative",
              backgroundColor: "#e9e9e9",
              zIndex: 10,
              overflow: "hidden",
            }}
          />
        )}

        <div className="w-full bottom-[7rem] z-5 px-6 pb-4">
          <div className="flex justify-between max-lg:flex-col gap-6">
            <div className="w-[1500px] h-[330px] p-4 bg-white border mt-3 rounded-xl max-lg:w-full">
              <div className="flex flex-col gap-4 w-[520px] p-4 border rounded-lg shadow-sm">
                <div className="flex gap-4">
                  <Avatar className="size-[80px]">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {selectedPilot?.name
                        ? selectedPilot.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                        : "KS"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="">
                    <p className="text-gray-800 font-medium">{selectedPilot?.name || "Kelvin Santos"}</p>
                    <p className="text-gray-600">{selectedPilot?.user.email || "kelvinmsantos223@gmail.com"}</p>
                    <div className="flex gap-2 text-sm mt-4">
                      <div className="rounded-full bg-[#5E56FF]/20 px-2 border border-[#5E56FF] text-[#5E56FF]">
                        Aproveitamentos: {utilization}%
                      </div>
                      <div className="rounded-full px-2 bg-[#FD3E3E]/20 text-[#FD3E3E] border border-[#FD3E3E]">
                        Descartados: {discardedPercentage}%
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="mt-2 bg-[#5E56FF] hover:bg-[#4A45CC] text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório de Percurso
                </Button>
              </div>

              <div className="w-full border mt-6 rounded-xl text-gray-600 text-base p-3 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p>Tempo de Trabalho</p>
                  <SquareArrowOutUpRight size={20} />
                </div>
                <div className="flex items-center justify-between">
                  <p>CNH</p>
                  <SquareArrowOutUpRight size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-3 w-full">
              <StatsCard text="Resolvidos" number={resolved} statistics={resolvedStatistics} status={resolvedStatistics > 0} />
              <StatsCard text="Pendentes" number={pending} statistics={pendingStatistics} status={pendingStatistics > 0} />
              <StatsCard text="Em análise" number={inAnalysis} statistics={inAnalysisStatistics} status={inAnalysisStatistics >0} />
              <StatsCard text="Descartados" number={discarded} statistics={discardedStatistics} status={discardedStatistics > 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
