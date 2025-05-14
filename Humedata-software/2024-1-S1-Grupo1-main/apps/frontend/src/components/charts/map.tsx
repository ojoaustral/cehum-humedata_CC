"use client"
import "leaflet/dist/leaflet.css"
import React, { useRef } from "react"
import { MapContainer, MapContainerProps, TileLayer, Marker, Popup, Rectangle } from "react-leaflet"
import { Icon } from "leaflet"
import { useRouter } from "next/navigation"

interface MapData {
  dev_id: string;
  dev_position: [number, number];
  zone_id: string;
  zone_name: string;
  zone_lat_max: number;
  zone_lat_min: number;
  zone_long_max: number;
  zone_long_min: number;
  location_name: string;
  organization: string;
  imageUrl: string;
}

interface MapProps {
    data: MapData[];
    mapHeight: number;
    mapWidth: number | string;
    onMarkerClick?: (id: string) => void;
    selectedZones?: string[];
}

const Map: React.FC<MapProps> = ({ data, mapHeight, mapWidth, onMarkerClick, selectedZones }) => {

  const router = useRouter()
  const mapOptions: MapContainerProps = {
    center: data[0]?.dev_position,
    zoom: 10,
    maxZoom: 20,
    minZoom: 3,
  }

  const customIcon = new Icon({
    iconUrl: "/assets/buoy.png",
    iconSize: [38, 30],
  })

  const customGreyIcon = new Icon({
    iconUrl: "/assets/black-buoy.png",
    iconSize: [38, 30]
  })

  const getMarkerIcon = (zone_id: string): Icon => {
    return selectedZones?.includes(zone_id) ? customIcon : customGreyIcon
  }

  const clickTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleMarkerDoubleClick = (zone_id: string) => {
    if (clickTimeout.current !== null) {
      // If a click has already been registered, this is a double click
      clearTimeout(clickTimeout.current)
      clickTimeout.current = null
      router.push(`/zona/${zone_id}`)
    } else {
      // Register the click and set a timeout
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null
        // Handle single click event here if needed
      }, 250) // 250ms delay; adjust as needed
    }
  }

  return (
    <div className='p-1 bg-green rounded-lg mx-auto my-auto' style={{ height: `${mapHeight}px`, width: `${mapWidth}` }}>
      <MapContainer className='z-0' {...mapOptions} doubleClickZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {data.map(({ dev_id, dev_position, zone_id, zone_name, zone_lat_max, zone_lat_min, zone_long_max, zone_long_min }, index) => (
          <React.Fragment key={index}>
            <Marker position={dev_position} icon={getMarkerIcon(zone_id)} eventHandlers={{ click: () => handleMarkerDoubleClick?.(zone_id) }}>
              <Popup>
                En zona: {zone_name}<br />
                Humedat@ ID: {dev_id}<br />
                Coordenadas: {dev_position[0]}, {dev_position[1]}
              </Popup>
            </Marker>
            <Rectangle bounds={[[zone_lat_max, zone_long_min], [zone_lat_min, zone_long_max]]} />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map