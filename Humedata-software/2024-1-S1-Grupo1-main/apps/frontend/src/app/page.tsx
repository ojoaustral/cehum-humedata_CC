"use client"
import Description from "@/components/description"
import ZonesChecklist from "@/components/zones/zones-checklist"
import MapSlider from "@/components/map-slider"
import { useState } from "react"

export default function Page(){

  const [selectedCluster, setSelectedCluster] = useState("")

  return (
    <>
      <Description />
      <ZonesChecklist onSelectCluster={setSelectedCluster}/>
      <MapSlider selectedCluster={selectedCluster} type="col" />
    </>

  )
};
