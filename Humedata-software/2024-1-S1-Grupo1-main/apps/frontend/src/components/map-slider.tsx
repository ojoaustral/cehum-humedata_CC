"use client"
import React, { useState, useEffect } from "react"
import ZoneSlider from "@/components/zones/zone-slider"
import dynamic from "next/dynamic"
import { trpc } from "@repo/trpc-client"

const Map = dynamic(() => import("./charts/map"), {
  ssr: false,
})

interface MapSliderData {
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

interface MapSliderProps {
    selectedZones?: string[];
    selectedCluster?: string;
    type?: "row" | "col";
}

const MapSlider: React.FC<MapSliderProps> = ({ type = "row", selectedZones }) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mapData, setMapData] = useState<MapSliderData[] | null>(null)

  const handleMarkerClick = (zone_id: string) => {
    setActiveId(zone_id)
  }

  const layoutClass = type === "row" ? "flex-row" : "flex-col"
  const mapSize = type === "row" ? { height: 400, width: "80%" } : { height: 500, width: "100%" }

  const { data, isLoading, isError } = trpc.zone.getMapData.useQuery()

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setMapData(data)
    }
  }, [data, isLoading, isError])
  
  const mappedZoneData = mapData ? mapData.map(({ dev_id, zone_id, zone_name, location_name, organization, imageUrl }) => ({ dev_id, zone_id, zone_name, location_name, organization, imageUrl })) : [];  let zoneData = mappedZoneData
  
  if (selectedZones && selectedZones.length > 0) {
    zoneData = mappedZoneData.filter(({ zone_id }) => selectedZones.includes(zone_id))
  }
  return (
    <div className={`flex ${layoutClass} mx-auto w-full`}>
      {type === "row" && (
        <div className="flex-grow">
          <ZoneSlider activeId={activeId} zoneData={zoneData} itemsToShow={1}/>
        </div>
      )}
      <div className="flex-grow" style={{ height: `${mapSize.height}px`, width: `${mapSize.width}` }}>
        {mapData && <Map data={mapData} mapHeight={mapSize.height} mapWidth={mapSize.width} onMarkerClick={handleMarkerClick} selectedZones={selectedZones}/>}
      </div>
      {type === "col" && (
        <div className="flex-grow">
          <ZoneSlider activeId={activeId} zoneData={zoneData} itemsToShow={2}/>
        </div>
      )}
    </div>
  )
}

export default MapSlider