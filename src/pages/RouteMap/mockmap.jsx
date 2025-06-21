import { useEffect, useRef, useState } from "react"
import { Loader } from "lucide-react"

export function MockMap() {
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Dados da rota e motorista
  const mapData = {
    rotas: {
      1: {
        origem: {
          lat: -10.914015349072995,
          lng: -37.05747454158684,
        },
        destino: {
          lat: -10.913722399512647,
          lng: -37.06764124732726,
        },
        pontos: [
          { lat: -10.918510962019544, lng: -37.05858760085174 },
          { lat: -10.914387169277912, lng: -37.059723609720564 },
          { lat: -10.918308153878922, lng: -37.05857612601468 },
          { lat: -10.914091044119944, lng: -37.061824383144184 },
          { lat: -10.918334900010487, lng: -37.06080814743181 },
          { lat: -10.914103620992181, lng: -37.06412663814286 },
          { lat: -10.917295390417884, lng: -37.06316638618917 },
          { lat: -10.914981066984947, lng: -37.05769675216143 },
          { lat: -10.917462305505175, lng: -37.06302166869205 },
          { lat: -10.917372805234232, lng: -37.05761408130508 },
          { lat: -10.917557699017555, lng: -37.063420054888475 },
          { lat: -10.917282102502774, lng: -37.06581218050222 },
          { lat: -10.917511475582515, lng: -37.06411049499028 },
          { lat: -10.9141714282158, lng: -37.05970688043362 },
          { lat: -10.91401013206392, lng: -37.05846038087003 },
          { lat: -10.914034578442422, lng: -37.05849418464861 },
          { lat: -10.916207285004273, lng: -37.06247711234317 },
          { lat: -10.916004999220268, lng: -37.06376660429613 },
          { lat: -10.91407953115284, lng: -37.062004044308395 },
          { lat: -10.914064546916755, lng: -37.05979130670031 },
          { lat: -10.91664752197894, lng: -37.06645189005826 },
          { lat: -10.914936369399618, lng: -37.06524637780432 },
          { lat: -10.914527774289581, lng: -37.064273623373694 },
          { lat: -10.918534104718859, lng: -37.067775539392386 },
          { lat: -10.917090770720945, lng: -37.06829434178451 },
          { lat: -10.914201254779124, lng: -37.06579729681315 },
          { lat: -10.917569966894348, lng: -37.0658486559263 },
          { lat: -10.915996561199462, lng: -37.06725589523509 },
          { lat: -10.918447439527352, lng: -37.06531452129816 },
          { lat: -10.917317819106565, lng: -37.06662931422899 },
          { lat: -10.916026819079871, lng: -37.06638279055446 },
          { lat: -10.916571460416343, lng: -37.06736888527682 },
          { lat: -10.916268882028254, lng: -37.065509685898064 },
          { lat: -10.916218452266952, lng: -37.06477011487447 },
          { lat: -10.917214607545418, lng: -37.06809544510979 },
          { lat: -10.918100314890944, lng: -37.064664777734265 },
          { lat: -10.915452672926838, lng: -37.06704434418566 },
        ],
      },
    },
    motoristas: {
      1: {
        lat: -10.913629175145063,
        lng: -37.067526160166736,
      },
    },
  }

  useEffect(() => {
    // Carrega a API do Google Maps
    const loadGoogleMapsAPI = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      window.initMap = initializeMap
      document.head.appendChild(script)
    }

    // Inicializa o mapa após o carregamento da API
    const initializeMap = () => {
      if (!mapRef.current) return
      setMapLoaded(true)

      const mapCenter = mapData.rotas["1"].origem

      // Cria o mapa
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      // Adiciona marcador de origem (verde)
      new window.google.maps.Marker({
        position: mapData.rotas["1"].origem,
        map,
        title: "Origem",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#00FF00",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      })

      // Adiciona marcador de destino (vermelho)
      new window.google.maps.Marker({
        position: mapData.rotas["1"].destino,
        map,
        title: "Destino",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      })

      // Adiciona marcador do motorista (azul)
      new window.google.maps.Marker({
        position: mapData.motoristas["1"],
        map,
        title: "Motorista",
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#0000FF",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
          rotation: 0,
        },
      })

      // Adiciona todos os pontos como marcadores no mapa
      mapData.rotas["1"].pontos.forEach((ponto, index) => {
        new window.google.maps.Marker({
          position: ponto,
          map,
          title: `Ponto ${index + 1}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 4,
            fillColor: "#FFFF00",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#000000",
          },
        })
      })

      // Abordagem híbrida: usar várias requisições do Directions Service para cobrir todos os pontos
      // e também desenhar linhas diretas para garantir que todas as ruas sejam marcadas

      // 1. Criar várias rotas com o Directions Service
      const createRouteSegments = async () => {
        const directionsService = new window.google.maps.DirectionsService()
        const pontos = [mapData.rotas["1"].origem, ...mapData.rotas["1"].pontos, mapData.rotas["1"].destino]

        // Criar segmentos de rota com no máximo 10 pontos cada
        const segmentSize = 10
        const segments = []

        for (let i = 0; i < pontos.length - 1; i += segmentSize - 1) {
          const segmentPoints = pontos.slice(i, i + segmentSize)
          if (segmentPoints.length < 2) continue

          segments.push(segmentPoints)
        }

        // Processar cada segmento
        for (const segment of segments) {
          if (segment.length < 2) continue

          const origin = segment[0]
          const destination = segment[segment.length - 1]
          const waypoints = segment.slice(1, segment.length - 1).map((point) => ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            stopover: false,
          }))

          try {
            const result = await new Promise((resolve, reject) => {
              directionsService.route(
                {
                  origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                  destination: new window.google.maps.LatLng(destination.lat, destination.lng),
                  waypoints: waypoints,
                  optimizeWaypoints: false,
                  travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (status === window.google.maps.DirectionsStatus.OK) {
                    resolve(result)
                  } else {
                    reject(status)
                  }
                },
              )
            })

            // Renderizar este segmento de rota
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
              map: map,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#0000FF",
                strokeOpacity: 0.7,
                strokeWeight: 5,
              },
            })

            directionsRenderer.setDirections(result)
          } catch (error) {
            console.error(`Erro ao calcular segmento de rota: ${error}`)

            // Fallback: desenhar linha reta para este segmento
            const routePolyline = new window.google.maps.Polyline({
              path: segment,
              geodesic: true,
              strokeColor: "#0000FF",
              strokeOpacity: 0.7,
              strokeWeight: 3,
            })

            routePolyline.setMap(map)
          }
        }

        // 2. Adicionar linhas diretas entre pontos próximos para garantir cobertura completa
        const distanceThreshold = 0.001 // Aproximadamente 100 metros

        for (let i = 0; i < pontos.length - 1; i++) {
          for (let j = i + 1; j < pontos.length; j++) {
            const point1 = pontos[i]
            const point2 = pontos[j]

            // Calcular distância entre os pontos
            const distance = Math.sqrt(Math.pow(point1.lat - point2.lat, 2) + Math.pow(point1.lng - point2.lng, 2))

            // Se os pontos estiverem próximos, conectá-los com uma linha
            if (distance < distanceThreshold) {
              const connectingLine = new window.google.maps.Polyline({
                path: [point1, point2],
                geodesic: true,
                strokeColor: "#0000FF",
                strokeOpacity: 0.4,
                strokeWeight: 2,
              })

              connectingLine.setMap(map)
            }
          }
        }

        setLoading(false)
      }

      createRouteSegments()
    }

    if (!mapLoaded) {
      loadGoogleMapsAPI()
    }

    return () => {
      // Limpeza
      window.initMap = undefined
    }
  }, [mapLoaded])

  return (
    <div className="w-full h-full flex flex-col max-h-[500px]">
      <div className="bg-white p-4 shadow-md rounded-lg my-5">
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
            <div className="w-4 h-4 bg-blue-500 mr-2 flex items-center justify-center">
              <span className="text-white text-xs">▲</span>
            </div>
            <span>Motorista</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-2">Carregando mapa...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className={`w-full h-[500px] rounded-lg ${loading ? "hidden" : "block"}`}></div>
    </div>
  )
}

