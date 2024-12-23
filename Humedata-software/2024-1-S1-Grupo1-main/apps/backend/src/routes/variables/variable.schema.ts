
export interface Zone {
  id: string
  min_latitude: number
  max_latitude: number
  min_longitude: number
  max_longitude: number
}

export interface Variable {
  id: string
  name: string
  params: string[]
  formula: string
}

export interface Log {
  timestamp: Date
  latitude: number
  longitude: number
  [key: string]: any
}

export interface Input {
  start_date: Date
  end_date: Date
}

export type ZoneData = {
  [zoneId: string]: Array<{
    timestamp: Date | null
    [variableId: string]: number | Date | null
  }>
}

export type VariableData = {
  [variableId: string]: {
    name: string
    id: string
    data: ZoneData
  }
}