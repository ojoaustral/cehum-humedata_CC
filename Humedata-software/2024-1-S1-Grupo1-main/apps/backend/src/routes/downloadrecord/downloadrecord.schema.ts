import { z } from "zod"

export const parameters = z.enum([
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
  "relative_density", 
  "salinity",
  "total_dissolved_solids", 
  "water_temperature",
])

export const createDownloadRecordSchema = z.object({
  location_name: z.string(),
  //params_id: z.array(parameters),
  params_id: z.array(z.string()),
  zones_id: z.array(z.string()),
  start_date: z.date(),
  end_date: z.date()
})

export const downloadRecordSchema = z.object({
  userId: z.string(),
  organization: z.string(),
  location_name: z.string(),
  //params_id: z.array(parameters), 
  params_id: z.array(z.string()),
  zones_id: z.array(z.string()),
  start_date: z.date(),
  end_date: z.date(),
  download_date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
