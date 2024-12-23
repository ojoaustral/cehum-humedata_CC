"use client"
import React, { useState, useMemo, useCallback } from "react"
import MapSlider from "@/components/map-slider"
import AnnotationTable from "@/components/tablas/annotation-table"
import ChartContainer from "@/components/charts-container"
import DataTable from "@/components/tablas/data-table"
import { trpc } from "@repo/trpc-client"
import { RawChartDataCollection } from "@/types/chart-data-types"

interface Parameter {
  id: string;
  name: string;
}

export default function ZonePage({ params }: { params: { id: string }}) {
  const selectedZones: string[] = [String(params.id)]
  const [dataChart, setDataChart] = useState<RawChartDataCollection | undefined>(undefined)
  const [selectedParameters, setSelectedParameters] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  
  const { data: parameters } = trpc.zone.getParametersByZone.useQuery({ zones_id: selectedZones})
  const { data: new_variables } = trpc.variable.getVariableByZone.useQuery({ zone_id: selectedZones[0] || "" })
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

  const zone = useMemo(() => mapData?.find((item) => item.zone_id === selectedZones[0]), [mapData, selectedZones])
  const zoneIdAndName = [{zone_id: zone?.zone_id, zone_name: zone?.zone_name}]

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
        <h2 className="text-2xl font-bold">Zona {zone?.zone_name}</h2>
        <MapSlider selectedZones={selectedZones} type="row" />
        <h2 className="pt-6 text-2xl font-bold">Variables Ambientales</h2>
        <ChartContainer selectedZones={selectedZones} initialParams={parameterIds} onDataChartChange={handleDataChartChange} onDateRangeChange={handleDateRangeChange} zonesIdAndName={zoneIdAndName} />
        <h2 className="text-2xl font-bold pb-3">Tablas</h2>
        {dataChart && (
          <DataTable rawData={dataChart} parameter_ids={selectedParameters} location_name={zone?.location_name ?? ""} selected_zones={selectedZones} zonesIdAndName={zoneIdAndName} />
        )
        }
        <AnnotationTable selectedZones={selectedZones} zonesIdAndName={zoneIdAndName} startDate={startDate} endDate={endDate} />
      </div>
    </div>
  )
}