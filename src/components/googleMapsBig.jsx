import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

export function GoogleMapsBig() {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBXrFDOX3QgRHeisAfz1v77UFhipej7yOM',
    })

    

    return (
        // <div className='h-screen border border-red-500'>
            
                isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "500px"}}
                      center={{
                        lat: -10.926523288502922, 
                        lng: -37.07283625035898
                      }}
                      zoom={15}
                    >

                        {/* <Marker position={position} options={{
                            label: {
                                text: label,
                                className: "mt-[-30px]"
                            }
                        }}/> */}

                    </GoogleMap>
                ) : (
                    <></> 
                )
            
        // </div>
    )
}