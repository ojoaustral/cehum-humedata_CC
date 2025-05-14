import React, { useState } from "react"
import { View, Text } from "react-native"
import { Button } from "@/components/Button"
import MapScreen from "./map"
import Visualization from "./visualization"
import DataLabel from "./dataLabel"

export default function VisualizationScreen() {
  const [shouldShowMap, setShouldShowMap] = useState(true)
  const [shouldShowDataLabel, setShouldShowDataLabel] = useState(false)
  const [zoneSelectedId, setZoneSelectedId] = useState(null)

  if (shouldShowMap) {
    return (
      <MapScreen setShowMap={[setShouldShowMap, setZoneSelectedId]} />
    )
  }

  if (!shouldShowMap && !shouldShowDataLabel) {
    return (
      <Visualization setShowMap={setShouldShowMap} showDataLabel={setShouldShowDataLabel} 
        zoneSelectedId = {zoneSelectedId} />
    )
  }

  if (shouldShowDataLabel) {
    return (
      <DataLabel setShowMap={setShouldShowMap} showDataLabel={setShouldShowDataLabel} />
    )
  }
}
