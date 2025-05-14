import React, { useState, useEffect, useMemo } from "react"
import MultiLineChart from "@/components/charts/multi-line-chart"
import MultiScatterChart from "./charts/scatter-chart"
import FilterDataCharts from "@/components/charts/filter-data-chart"
import { getTimeRangeFromQuickRange } from "@/hooks/get-time-quick-range"
import { convertTimestampsToNumbers } from "@/hooks/transform-timestamp-to-number"
import { Switch } from "@ui/components/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/popover"
import { trpc } from "@repo/trpc-client"
import LoadingSkeleton from "./skeletons/loading-skeleton"
import { RawChartDataCollection, ChartDataCollection, ZoneData, Measurement } from "@/types/chart-data-types"
import { FiInfo } from "react-icons/fi"
import GaugeChart from "./charts/gauge-chart"

interface ChartContainerProps {
  selectedZones: string[];
  initialParams: string[];
  onDataChartChange: (data: RawChartDataCollection) => void;
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void; 
  zonesIdAndName: { zone_id: string | undefined, zone_name: string | undefined }[]; // Info to pass to each chart
}

const ChartContainer: React.FC<ChartContainerProps> = ({ selectedZones, initialParams, onDataChartChange, onDateRangeChange, zonesIdAndName }) => {
  const [selectedCharts, setSelectedCharts] = useState<string[]>(initialParams)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [quickRange, setQuickRange] = useState<string | undefined>("l-7-day")
  const [dataChart, setDataChart] = useState<ChartDataCollection>()
  const [showCharts, setShowCharts] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [movingAverage, setMovingAverage] = useState<boolean>(false) // State for moving average
  const [requestStartDate, setRequestStartDate] = useState<Date>(getTimeRangeFromQuickRange("l-7-day").startQuickRange)
  const [requestEndDate, setRequestEndDate] = useState<Date>(getTimeRangeFromQuickRange("l-7-day").endQuickRange)
  const [chartType, setChartType] = useState<"puntos" | "lineas">("puntos")

  const { data: new_variables } = trpc.variable.getVariableByZone.useQuery({ zone_id: selectedZones[0] || "" })
  const variableIds = useMemo(() => new_variables?.map(variable => variable.id) || [], [new_variables])
  
  // Filter selectedCharts to get parameters
  const parametersFromSelectedCharts = useMemo(() => {
    return selectedCharts.filter(chart => !variableIds.includes(chart))
  }, [selectedCharts, variableIds])

  // Filter selectedCharts to get variables
  const variablesFromSelectedCharts = useMemo(() => {
    return selectedCharts.filter(chart => variableIds.includes(chart))
  }, [selectedCharts, variableIds])
  
  const handleChartTypeToggle = () => setChartType(chartType === "puntos" ? "lineas" : "puntos")

  const handleMovingAverageToggle = () => setMovingAverage(!movingAverage)

  useEffect(() => {
    setSelectedCharts(initialParams)
  }, [initialParams])

  const calculateMovingAverage = (data: ZoneData): ZoneData => {
    const result: ZoneData = {}
    const defaultWindowSize = 3
  
    for (const zoneId in data) {
      const measurements = data[zoneId]
  
      if (!measurements || !movingAverage) {
        result[zoneId] = []
        continue
      }
  
      const smoothedData: Measurement[] = []
  
      const keys = measurements[0] ? Object.keys(measurements[0]).filter(key => key !== "timestamp") : []
  
      for (let i = 0; i < measurements.length; i++) {
        const currentWindowSize = Math.min(defaultWindowSize, i + 1)
        const start = Math.max(0, i - currentWindowSize + 1)
        const windowData = measurements.slice(start, i + 1)
        
        const measurement = measurements[i]

        const smoothedMeasurement: any = {
          timestamp: measurement?.timestamp ?? null, 
        }

        keys.forEach(key => {
          const sum = windowData.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0)
          const average = sum / windowData.length

          smoothedMeasurement[key] = average
        })
  
        smoothedData.push(smoothedMeasurement)
      }
  
      result[zoneId] = smoothedData
    }
  
    return result
  }
  
  const handleVisualizeCharts = () => {
    if (selectedCharts.length > 0 && ((startDate && endDate && (endDate >= startDate)) || quickRange)) {
      if (quickRange) {
        const { startQuickRange, endQuickRange } = getTimeRangeFromQuickRange(quickRange)
        setRequestStartDate(startQuickRange)
        setRequestEndDate(endQuickRange)
        onDateRangeChange(startQuickRange, endQuickRange)
      } else if (startDate && endDate) {
        setRequestStartDate(startDate)
        setRequestEndDate(endDate)
        onDateRangeChange(startDate, endDate)

      }
      setShowCharts(true)
      setError(null)
    } else if (selectedCharts.length === 0 || !requestStartDate || !requestEndDate) {
      setShowCharts(false)
    }
  }

  useEffect(() => {
    handleVisualizeCharts()
  }, [selectedCharts, quickRange, startDate, endDate])

  const { data: timeSeries, isLoading, isError } = trpc.zoneTimeSeries.getTimeSeriesByZones.useQuery({
    zones_id: selectedZones,
    parameters: parametersFromSelectedCharts,
    start_date: requestStartDate,
    end_date: requestEndDate,
  })

  const { data: variableTimeSeries } = trpc.variable.getTimeSeriesByVariable.useQuery({
    zones_id: selectedZones,
    variables: variablesFromSelectedCharts,
    start_date: requestStartDate,
    end_date: requestEndDate,
  })

  useEffect(() => {
    if (isError) {
      setError("Error al obtener los gráficos")
      setShowCharts(false)
    } else if (!isError) {
      setError(null)
      setShowCharts(true)
    }
  }, [isError])

  useEffect(() => {
    if (timeSeries && variableTimeSeries) {
      const combinedTimeSeries: RawChartDataCollection = {
        ...timeSeries,
        ...variableTimeSeries
      }
  
      onDataChartChange(combinedTimeSeries)
      const transformedChartData: ChartDataCollection = convertTimestampsToNumbers(combinedTimeSeries)
  
      const chartDataWithMA: ChartDataCollection = {}
      for (const paramId in transformedChartData) {
        const chartData = transformedChartData[paramId]
        if (chartData) {
          chartDataWithMA[paramId] = {
            ...chartData,
            data: chartData.data,
            movingAverageData: calculateMovingAverage(chartData.data),
          }
        }
      }
      setDataChart(chartDataWithMA)
    }
  }, [timeSeries, variableTimeSeries, onDataChartChange, movingAverage])
  

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])


  const internalVariables = [
    {
      name: "battery_level",
      maxValue: 14
    },
    {
      name: "internal_humidity",
      maxValue: 110
    },
    {
      name: "internal_pressure",
      maxValue: 200
    },
    {
      name: "internal_temperature",
      maxValue: 50
    }
  ]

  const internalVariableNames = internalVariables.map(variable => variable.name)


  return (
    <div className="mx-2">
      <div className="flex flex-row container mx-auto px-4 pb-4 pt-2">
        <FilterDataCharts
          selectedZones={selectedZones}
          selectedCharts={selectedCharts}
          setSelectedCharts={setSelectedCharts}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          quickRange={quickRange}
          setQuickRange={setQuickRange}
          handleVisualizeCharts={handleVisualizeCharts}
        />
        {error && <div className="text-red-600 text-sm xs:text-xs ml-8 mt-7">{error}</div>}
      </div>
      <div className="px-3 pb-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch checked={chartType === "lineas"} onCheckedChange={handleChartTypeToggle} />
            <span>{chartType === "puntos" ? "Gráfico de puntos" : "Gráfico de líneas"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={movingAverage} onCheckedChange={handleMovingAverageToggle} />
            <span>Suavizado Móvil</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xl">
                <FiInfo />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-sm text-justify">
                      <ul className="list-disc list-inside">
                        <li>Al activar el suavizado móvil, los puntos de datos se reemplazan por promedios calculados sobre un conjunto de valores vecinos.</li>
                        <li>Esto suaviza las fluctuaciones bruscas y permite identificar patrones más fácilmente.</li>
                        <li>Es especialmente útil cuando se quiere analizar la dirección general de los datos sin que las variaciones menores distraigan.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-xl right-0 ">
              <FiInfo />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-sm text-justify">
                    <ul className="list-disc list-inside">
                      <li>Si en vez del nombre de la zona aparece el ID, es debido a que no se tienen datos de la zona seleccionada.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
        
      <div className="flex flex-wrap justify-between">
        {isLoading ? (
          <LoadingSkeleton text="gráficos" />
        ) : (
          showCharts &&
            dataChart &&
            selectedCharts.map((chartId) => {
              const chartDataForId = dataChart[chartId]
  
              if (!chartDataForId) {
                return null
              }
  
              return (
                <div key={chartId} className="w-full sm:w-1/2 px-2">
                  {chartType === "puntos" ? (
                    <MultiScatterChart
                      data={chartDataForId.data}
                      movingAverageData={chartDataForId.movingAverageData}
                      title={chartDataForId.name}
                      param_id={chartDataForId.id}
                      start_date={startDate}
                      end_date={endDate}
                      selected_zones={selectedZones}
                      zonesIdAndName={zonesIdAndName}
                    />
                  ) : (
                    <MultiLineChart
                      data={chartDataForId.data}
                      movingAverageData={chartDataForId.movingAverageData}
                      title={chartDataForId.name}
                      param_id={chartDataForId.id}
                      start_date={startDate}
                      end_date={endDate}
                      selected_zones={selectedZones}
                      zonesIdAndName={zonesIdAndName}
                    />
                  )}
                </div>
              )
            })
        )}
      </div>
      <h2 className="text-2xl font-bold py-3">Variables Internas</h2>
      <div className="flex flex-wrap justify-between">
        {isLoading ? (
          <LoadingSkeleton text="gráficos" />
        ) : (
          showCharts &&
          dataChart &&
          Object.keys(dataChart)
            .filter(chartId => internalVariableNames.includes(chartId))
            .map((chartId) => {
              const chartDataForId = dataChart[chartId]

              if (!chartDataForId) {
                return null
              }

              return (
                <div key={chartId} className="w-full sm:w-1/2 px-2">
                  {chartType === "puntos" ? (
                    <MultiScatterChart
                      data={chartDataForId.data}
                      movingAverageData={chartDataForId.movingAverageData}
                      title={chartDataForId.name}
                      param_id={chartDataForId.id}
                      start_date={startDate}
                      end_date={endDate}
                      selected_zones={selectedZones}
                      zonesIdAndName={zonesIdAndName}
                    />
                  ) : (
                    <MultiLineChart
                      data={chartDataForId.data}
                      movingAverageData={chartDataForId.movingAverageData}
                      title={chartDataForId.name}
                      param_id={chartDataForId.id}
                      start_date={startDate}
                      end_date={endDate}
                      selected_zones={selectedZones}
                      zonesIdAndName={zonesIdAndName}
                    />
                  )}
                </div>
              )
            })
        )}


      </div>
      <div className="w-full shadow-xl">
        {showCharts &&
        dataChart &&
        !isLoading && 
        zonesIdAndName.map((zone) => {
          const zoneName = zone.zone_name
          const zoneId = zone.zone_id

          return (
            <div key={zone.zone_id} className="mb-6">
              <h2 className="text-2xl text-center font-bold pb-3">{zoneName}</h2>

              <div className="flex flex-wrap justify-between">
                {Object.keys(dataChart)
                  .filter((chartId) => internalVariableNames.includes(chartId))
                  .map((chartId) => {
                    const chartDataForId = dataChart[chartId]
          

                    if (!chartDataForId || !chartDataForId.data || !zoneId || !chartDataForId.data[zoneId]) {
                      return null
                    }
                    const dataLength = chartDataForId.data[zoneId]?.length
                    const data = chartDataForId.data[zoneId]
                    
                    if (!data || !dataLength || !data[dataLength - 1]) {
                      return null
                    }
                    const lastData = data[dataLength - 1]

                    if (!lastData) {
                      return null
                    }

                    const value = Number(lastData[chartId])
                    const maxValue = internalVariables.find((variable) => variable.name === chartId)?.maxValue

                    if (!maxValue || !value) {
                      return null
                    }

                    const gaugeData = {
                      name: chartDataForId.name,
                      value: value,
                      maxValue: maxValue,
                    }

                    return (
                      <div key={`${chartId}-${zoneId}`} className="w-full sm:w-1/4 mb-3">
                        <GaugeChart name={chartDataForId.name} value={gaugeData.value} maxValue={gaugeData.maxValue} color="#008cc0" />
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChartContainer
