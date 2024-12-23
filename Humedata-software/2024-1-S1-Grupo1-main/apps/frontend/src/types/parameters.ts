export const validParameterIds = [
  "atmospheric_pressure",
  "atmospheric_temperature",
  "battery_level",
  "dissolved_oxygen",
  "electrical_conductivity",
  "internal_humidity",
  "internal_pressure",
  "internal_temperature",
  "oxide_reduction_potential",
  "ph",
  "ph_temp",
  // "relative_density",
  "salinity",
  "total_dissolved_solids",
  "water_temperature",
  "ec_temp",
  "sat",
] as const

export type ParameterIdType = typeof validParameterIds[number]

export interface Parameter {
  id: string;
  name: string;
}