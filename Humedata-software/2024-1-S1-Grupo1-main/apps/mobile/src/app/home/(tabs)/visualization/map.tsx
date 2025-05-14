import React, { useState, useEffect } from "react"
import { View, StyleSheet, Text, Image } from "react-native"
import { Button } from "@/components/Button"
import { LeafletView, MapMarker } from "react-native-leaflet-view"
import { trpc } from "@trpc-client/index"
import icon from "@/assets/images/icon.png"
import { set } from "zod"

export default function MapScreen({ setShowMap }) {
  const [title, setTitle] = useState("Seleccione la boya a visualizar:")
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [mapCenterPosition, setMapCenterPosition] = useState({ lat: -39.851, lng: -73.307 })
  const [zoom, setZoom] = useState(11)
  const [selectedZoneId, setSelectedZoneId] = useState(null)


  const { data, isLoading, isError, error } = trpc.zone.getMapData.useQuery();
 

  const handleVisualizar = () => {
    setShowMap[0](false)
    setShowMap[1](selectedZoneId)
  }

  useEffect(() => {
    if (data && !isLoading && !isError) {
      const uniquePositions = new Set();
      const markers = data.reduce((acc, item) => {
        const positionKey = `${item.dev_position[0]},${item.dev_position[1]}`;
        if (!uniquePositions.has(positionKey)) {
          uniquePositions.add(positionKey);
          const lng = (item.zone_long_max + item.zone_long_min) / 2
          const lat = (item.zone_lat_max + item.zone_lat_min) / 2
          acc.push({
            id: item.dev_id,
            zone: item.zone_name,
            zoneId: item.zone_id,
            position: {
              lat: lat,
              lng: lng,
            },
            icon: "📍",
            size: [32, 32],
          });
        }
        return acc;
      }, []);
  
      setMarkers(markers);
      setMapCenterPosition({
        lat: markers[0]?.position?.lat || -39.851,
        lng: markers[0]?.position?.lng || -73.307,
      });
    }
  }, [data, isLoading, isError]);
  

  useEffect(() => {
    const selectedMarkerData = markers.find(marker => marker.id === selectedMarker);
    if (selectedMarkerData && selectedMarkerData.zone) {
      setTitle(`Zona seleccionada: ${selectedMarkerData.zone}`);
    }

    if (selectedMarkerData) {
      setSelectedZoneId(selectedMarkerData.zoneId)
      const { lat, lng } = selectedMarkerData.position;
      setMapCenterPosition({ lat, lng });

    }
  }, [selectedMarker, markers]);


  const onMessageReceived = (message) => {
    if (message?.payload?.mapMarkerID) {
      setSelectedMarker(message?.payload?.mapMarkerID)
    }
    else if (message?.event === "onMapClicked"){
      setSelectedMarker(null)
      setTitle("Seleccione la zona a visualizar:")
    }
  }

  return (
    <View style={styles.container}>
      {!isError && <>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.mapcontainer}>
          <LeafletView
            doDebug={false}
            mapMarkers={markers}
            mapCenterPosition={mapCenterPosition}
            zoom={zoom}
            onMessageReceived={onMessageReceived}
            style={styles.map}
          />
        </View>
        {selectedMarker && (
          <Button
            variant = "default"
            style={styles.button}
            label="visualizar"
            onPress={handleVisualizar}
          />
        )}
      </>
      }
      {isError && 
      <View style={styles.errorMessage}>
        <Image
          source={icon}
        />
        <Text style={styles.title}>Sin señal de Wifi o Red</Text>
      </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    marginBottom: 20,
    fontSize: 20,

  },
  map: {
    width: 350,
    height: 300,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    borderRadius: 50,
    height: 50,
    width: 120,
  },
  mapcontainer: {
    width: 350,
    height: "80%",
    borderRadius: 10,
    overflow: "hidden",
  },
  popup: {
    backgroundColor: "grey",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  errorMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: "50%",
  },

})


