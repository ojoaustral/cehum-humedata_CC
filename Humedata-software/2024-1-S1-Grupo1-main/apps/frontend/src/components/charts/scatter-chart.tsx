import React, { useMemo, memo, useState } from "react"
import { Label, Scatter, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ZAxis } from "recharts"
import moment from "moment"
import chroma from "chroma-js"
import { trpc } from "@repo/trpc-client"
import { FormatXAxis, RenderAnnotationIcon, ranges_labels } from "./shared-charts-hooks"

interface Measurement {
  timestamp: number;
  [key: string]: number | string;
}

interface ZoneData {
  [key: string]: Measurement[]
}

interface MultiScatterChartProps {
  data: ZoneData;
  movingAverageData?: ZoneData;
  param_id: string;
  title: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  selected_zones: string[];
  zonesIdAndName: { zone_id: string | undefined, zone_name: string | undefined }[];
}

interface Annotation {
  id: string;
  zoneId: string;
  type: string;
  content: string | null;
  tag: string | null;
  start_date: number | null;
  end_date: number | null;
  params_id: string[];
}

const CustomTooltip = memo(({ active, payload, param_name }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="text-xs bg-white border border-gray-300 p-2">
        <p>{moment(data.timestamp).format("D/MM/YYYY, HH:mm:ss")}</p>
        <p>{param_name}: {payload[0].value}</p>
      </div>
    )
  }
  return null
})

const MultiScatterChart: React.FC<MultiScatterChartProps> = ({ data, movingAverageData, title, param_id, start_date, end_date, selected_zones, zonesIdAndName }) => {
  const [msgErrorAnnotations, setMsgErrorAnnotations] = useState<string | null>(null)

  // Get notes from backend
  const { data: annotations, isError: annotationsError } = trpc.note.get.useQuery({
    start_date,
    end_date,
    zones_ids: selected_zones,
  })

  const dataChart = useMemo(() => Object.keys(data), [data])
  
  // Filter notes by zones_id present in dataChart and param_id in annotation.params_id
  const filteredAnnotations: Annotation[] = useMemo(() => {
    if (!annotations) return []
    return annotations
      .filter(annotation => dataChart.includes(annotation.zoneId) && annotation.params_id.includes(param_id))
      .map(annotation => ({
        ...annotation,
        start_date: annotation.start_date ? new Date(annotation.start_date).getTime() : null,
        end_date: annotation.end_date ? new Date(annotation.end_date).getTime() : null,
      }))
  }, [annotations, dataChart, param_id])

  const colors = useMemo(() => chroma.scale(["#E74C3C", "#9B59B6", "#2980B9", "#3498DB", "#1ABC9C", "#2ECC71", "#F1C40F", "#F39C12"]).mode("lab").colors(dataChart.length), [dataChart.length])
  
  const sampledData = useMemo(() => {
    const reduceData = (dataArray: Measurement[], step: number) => 
      dataArray.filter((_, index) => index % step === 0).map(d => ({ ...d, timestamp: d.timestamp }))
    const sampled: ZoneData = {}
    for (const zoneId in data) {
      const zoneData = data[zoneId]
      if (zoneData) {
        const step = Math.ceil(zoneData.length / 100)
        sampled[zoneId] = reduceData(zoneData, step)
      }
    }
    return sampled
  }, [data])

  const sampledMovingAverageData = useMemo(() => {
    if (!movingAverageData) return {}
    const reduceData = (dataArray: Measurement[], step: number) =>
      dataArray.filter((_, index) => index % step === 0).map(d => ({ ...d, timestamp: d.timestamp }))
    const sampled: ZoneData = {}
    for (const zoneId in movingAverageData) {
      const zoneData = movingAverageData[zoneId]
      if (zoneData) {
        const step = Math.ceil(zoneData.length / 100)
        sampled[zoneId] = reduceData(zoneData, step)
      }
    }
    return sampled
  }, [movingAverageData])

  // Function to get zone_name based on zone_id
  const getZoneName = (zone_id: string) => {
    const zone = zonesIdAndName?.find(z => z.zone_id === zone_id)
    return zone ? zone.zone_name : zone_id
  }

  // ranges and labels in Y Axis
  const yAxisProps = useMemo(() => {
    const rangeLabel = ranges_labels[param_id]
    return rangeLabel ? { domain: [rangeLabel.min, rangeLabel.max] as [number, number], label: { value: rangeLabel.label, position: "top", offset: 15, fontSize: 12 } } : { domain: ["auto", "auto"] as [string, string], label: "" }
  }, [param_id])

  if (annotationsError) {
    setMsgErrorAnnotations("Error al obtener las anotaciones.")
  }

  return (
    <div className="w-full mb-8 border border-gray-300 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue text-white p-2">
        <h3 className="text-center text-l font-bold">{title}</h3>
      </div>
      <div className="pr-4 bg-white">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="timestamp" type="number" stroke="#333" allowDuplicatedCategory={false} domain={["dataMin", "dataMax"]} tickFormatter={FormatXAxis} tick={{ fontSize: 12 }} />
            <YAxis dataKey={param_id} type="number" stroke="#333" tick={{ fontSize: 12 }} {...yAxisProps} allowDataOverflow />
            <ZAxis range={[20, 20]} /> {/* This is to set the size of the dot */}
            <Tooltip content={<CustomTooltip param_name={title} />} cursor={{ strokeDasharray: "3 3" }} />
            <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px", paddingBottom: "15px", fontSize: "12px" }} />
            {Object.keys(sampledData).map((zoneId, index) => (
              <Scatter 
                key={zoneId}
                data={sampledData[zoneId]} 
                name={getZoneName(zoneId)}
                dataKey={param_id}
                fill={colors[index % colors.length]}
                fillOpacity={0.7}
                isAnimationActive={false}
              />
            ))}
            {Object.keys(sampledMovingAverageData).length > 0 && Object.keys(sampledMovingAverageData).map((zoneId, index) => (
              <Line
                key={`${zoneId}-ma`}
                data={sampledMovingAverageData[zoneId]}
                name={`${zoneId} MA`}
                dataKey={param_id}
                fill={chroma(colors[index % colors.length] || "#F39C12").alpha(0.5).css()}
                fillOpacity={0.5}
                isAnimationActive={false}
                dot={false}
                legendType="none"
                type={"monotone"}
              />
            ))}
            {filteredAnnotations.map((annotation, index) => (
              <React.Fragment key={index}>
                <ReferenceLine 
                  isFront
                  x={annotation.start_date ?? undefined}
                  stroke="#575757"
                  strokeDasharray="3 3"
                  label={<Label position="top" content={RenderAnnotationIcon(annotation, "start")} />}
                />
                <ReferenceLine 
                  isFront
                  x={annotation.end_date ?? undefined}
                  stroke="#575757"
                  strokeDasharray="3 3"
                  label={<Label position="top" content={RenderAnnotationIcon(annotation, "end")} />}
                />
              </React.Fragment>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {msgErrorAnnotations && <div className="text-red-600 text-sm xs:text-xs ml-2 mt-2">{msgErrorAnnotations}</div>}
    </div>
  )
}

export default MultiScatterChart
