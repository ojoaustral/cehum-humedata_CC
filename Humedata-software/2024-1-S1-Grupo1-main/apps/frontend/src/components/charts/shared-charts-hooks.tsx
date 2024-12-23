import React from "react"
import moment from "moment"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import { IconStartAnnotation, IconEndAnnotation} from "@/components/charts/custom-icon-chart"

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

interface RangeLabel {
  min: number;
  max: number;
  label: string;
}

interface RangesLabels {
  [key: string]: RangeLabel;
}

export const FormatXAxis = (tickItem: number) => {
  return moment(tickItem).format("D/MM/YY")
}

export const RenderAnnotationIcon = (annotation: Annotation, type: "start" | "end") => ({ viewBox: { x, y } }: any) => {
  const d = 20
  const r = d / 2

  let transform 
  if (type === "start") {
    transform = `translate(${x - r/1.5} ${y - r/2})`
  } else if (type === "end") {
    transform = `translate(${x - r - 3.4} ${y + r})` // The position of the IconEnd is lower than the position of the IconStart on the Y axis.
  }

  const content = (
    <div className="text-xs max-w-xxs break-words p-1">
      {type === "start" ? (
        <>
          <div className="pb-1">Inicio {annotation.tag} </div>
          <div className="pb-1">{annotation.content}</div>
          <div>{moment(annotation.start_date).format("D/MM/YYYY, HH:mm:ss")}</div>
        </>
      ) : (
        <>
          <div className="pb-1">Fin {annotation.tag} </div>
          <div>{moment(annotation.end_date).format("D/MM/YYYY, HH:mm:ss")}</div>
        </>
      )}
    </div>
  )

  return (
    <Tippy content={content} >
      <g transform={transform} style={{ cursor: "pointer" }} >
        {type === "start" ? 
          <IconStartAnnotation size={d} />
          :
          <IconEndAnnotation size={d} />
        }
      </g>
    </Tippy>
  )
}

export const ranges_labels: RangesLabels = {
  "atmospheric_pressure": { min: 900, max: 1040, label: "hPa" },
  "atmospheric_temperature": { min: -5, max: 35, label: "°C" },
  "water_temperature": { min: 0, max: 30, label: "°C" },
  "dissolved_oxygen": { min: 0, max: 15, label: "mg/L" },
  "sat": { min: 0, max: 125, label: "%" },
  "electrical_conductivity": { min: 0, max: 50000, label: "uS/cm" },
  "ec_temp": { min: 0, max: 50000, label: "uS/cm a 25°C" },
  "salinity": { min: 0, max: 36, label: "PSU" },
  "total_dissolved_solids": { min: 0, max: 25000, label: "ppm" },
  "ph": { min: 0, max: 14, label: "pH" },
  "ph_temp": { min: 0, max: 14, label: "pH" },
  "oxide_reduction_potential": { min: 0, max: 500, label: "mV" },
  "internal_temperature": { min: 0, max: 50, label: "°C" },
  "internal_humidity": { min: 0, max: 110, label: "%" }
}