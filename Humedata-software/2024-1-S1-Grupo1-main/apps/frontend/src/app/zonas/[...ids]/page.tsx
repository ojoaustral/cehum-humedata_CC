"use client"
import React, { useEffect, useState, useMemo, useCallback } from "react"
import MapSlider from "@/components/map-slider"
import DataTable from "@/components/tablas/data-table"
import AnnotationTable from "@/components/tablas/annotation-table"
import ChartContainer from "@/components/charts-container"
import { usePathname } from "next/navigation"
import { trpc } from "@repo/trpc-client"
import { RawChartDataCollection } from "@/types/chart-data-types"

interface Parameter {
  id: string;
  name: string;
}

export default function ZonesPage() {
  const pathname = usePathname()
  const [individualIds, setIndividualIds] = useState<string[]>([])
  const [dataChart, setDataChart] = useState<RawChartDataCollection | undefined>(undefined)
  const [selectedParameters, setSelectedParameters] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  useEffect(() => {
    const segments = pathname.split("/")
    const idsSegment = segments[segments.length - 1]
    const ids = idsSegment?.split("-")
    setIndividualIds(ids || [])
  }, [])
  
  const { data: parameters } = trpc.zone.getParametersByZone.useQuery({ zones_id: individualIds})
  const { data: new_variables } = trpc.variable.getVariableByZone.useQuery({ zone_id: individualIds[0] || "" })
  const availableParameters: Parameter[] = useMemo(() => [
    ...(parameters?.parameters || []),
    ...(new_variables?.map(variable => ({ id: variable.id, name: variable.name })) || [])
  ], [parameters, new_variables])

  // Don't show by default
  const excludedParams = ["salinity", "total_dissolved_solids"]
  
  const parameterIds: string[] = useMemo(() => 
    availableParameters.map(parameter => parameter.id)
      .filter(id => !excludedParams.includes(id)), 
  [availableParameters]
  )
  const { data: mapData } = trpc.zone.getMapData.useQuery()

  const mappedZoneData = mapData ? mapData.map(({ dev_id, zone_id, zone_name, location_name, organization, imageUrl }) => ({ dev_id, zone_id, zone_name, location_name, organization, imageUrl })) : []
  
  const zoneData = mappedZoneData.filter(zone => individualIds.includes(zone.zone_id))
  const firstZoneData = zoneData[0]
  const location_name = firstZoneData ? firstZoneData.location_name : "Desconocido"
  const zonesNames = zoneData?.map(zone => zone.zone_name)
  const zonesIdAndName = zoneData?.map(zone => ({ zone_id: zone.zone_id, zone_name: zone.zone_name }))

  const handleDataChartChange = useCallback((newDataChart: RawChartDataCollection) => {
    setDataChart(newDataChart)
    const paramsids = Object.keys(newDataChart).map(key => newDataChart[key]?.id).filter(Boolean) as string[]
    setSelectedParameters(paramsids)
  }, []) 

  const handleDateRangeChange = useCallback((start: Date | undefined, end: Date | undefined) => {
    setStartDate(start)
    setEndDate(end)
  }, [])

  return (
    <div className="min-h-screen my-5">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Zonas seleccionadas</h2>
        <div>
          <p>{zonesNames.join(", ")}</p>
        </div>
        <MapSlider selectedZones={individualIds} type="row" />
        <h2 className="pt-6 text-2xl font-bold">Variables Ambientales</h2>
        <ChartContainer selectedZones={individualIds} initialParams={parameterIds} onDataChartChange={handleDataChartChange}  onDateRangeChange={handleDateRangeChange} zonesIdAndName={zonesIdAndName} />
        <h2 className="text-2xl font-bold pb-3">Tablas</h2>
        {dataChart && (
          <DataTable rawData={dataChart} location_name={location_name} selected_zones={individualIds} parameter_ids={selectedParameters} zonesIdAndName={zonesIdAndName} />
        )
        }
        <AnnotationTable selectedZones={individualIds} startDate={startDate} endDate={endDate} zonesIdAndName={zonesIdAndName} />
      </div>
    </div>
  )
}