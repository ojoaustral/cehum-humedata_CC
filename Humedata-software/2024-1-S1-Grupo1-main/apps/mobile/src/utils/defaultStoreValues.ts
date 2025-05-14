import {Sensor, CustomCommand, ChartData} from "@/utils/useStore"

type defaultCommandType = {
 [key: string]: CustomCommand[];
}

export const defaultChartData: ChartData[] = [
  { label: "Presión Atmosférica", trpcKey: "atmospheric_pressure", minY: 90, maxY: 104 },
  { label: "Temperatura Atmosférica", trpcKey: "atmospheric_temperature", minY: -5, maxY: 35 },
  { label: "Carga de batería", trpcKey: "battery_level", minY: 0, maxY: 100 },
  { label: "Oxígeno disuelto", trpcKey: "dissolved_oxygen", minY: 0, maxY: 1.5 },
  { label: "Conductividad eléctrica", trpcKey: "electrical_conductivity" },
  { label: "Humedad interna", trpcKey: "internal_humidity", minY: 0, maxY: 110 },
  { label: "Presión interna", trpcKey: "internal_pressure" },
  { label: "Temperatura interna", trpcKey: "internal_temperature", minY: 0, maxY: 50 },
  { label: "Potencial Redox", trpcKey: "oxide_reduction_potential", minY: -500, maxY: 500 },
  { label: "pH", trpcKey: "ph", minY: 0, maxY: 14 },
  { label: "Densidad relativa", trpcKey: "relative_density"},
  { label: "Salinidad", trpcKey: "salinity" },
  { label: "Sólidos disueltos", trpcKey: "total_dissolved_solids" },
  { label: "Temperatura del agua", trpcKey: "water_temperature", minY: 0, maxY: 30 },
  { label: "Saturación", trpcKey: "sat", minY: 0, maxY: 125 },
]


export const defaultSensors: Sensor[] = [
  {
    name: "DO",
    prefix: "do_",
    readingFormat: "csv",
    csvHeaders: [
      { id: 0, name: "DO" },
      { id: 1, name: "SAT" },
    ]
  },
  {
    name: "PH",
    prefix: "ph_",
    readingFormat: "float",
    csvHeaders: []
  },
  {
    name: "EC",
    prefix: "ec_",
    readingFormat: "csv",
    csvHeaders: [
      { id: 0, name: "EC" },
      { id: 1, name: "TDS" },
      { id: 2, name: "SAL" },
      { id: 3, name: "SG" },
    ]
  },
  {
    name: "OPR",
    prefix: "opr_",
    readingFormat: "float",
    csvHeaders: []
  },
]

export const defaultCustomCommands: defaultCommandType = {
  DO: [
    { name: "Cal", value: "cal" },
    { name: "Leer", value: "r", repeatable: true },
    { name: "Info", value: "i" },
  ],
  PH: [
    { name: "Cal", value: "cal" },
    { name: "Leer", value: "r", repeatable: true},
    { name: "Info", value: "i" },
  ],
  EC: [
    { name: "Cal", value: "cal" },
    { name: "Leer", value: "r", repeatable: true},
    { name: "Info", value: "i" },
  ],
  OPR: [
    { name: "Cal", value: "cal" },
    { name: "Leer", value: "r", repeatable: true},
    { name: "Info", value: "i" },
  ],
}

export const defaultBaudRate = 9600

// miliseconds
export const defaultRepeatableDuration = 0
export const defaultRepeatableInterval = 1000
