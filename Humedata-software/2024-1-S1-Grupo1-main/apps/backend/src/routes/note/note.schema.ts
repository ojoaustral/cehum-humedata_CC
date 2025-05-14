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

export const types = z.enum([
  "public",
  "private",
])

export const createNoteSchema = z.object({
  zones_id: z.array(z.string()),
  //params_ids: z.array(parameters), 
  params_ids: z.array(z.string()),
  content: z.string().max(200), 
  start_date: z.date(),
  end_date: z.date(),
  type: types,
  tag: z.string(),
})

export const getNotesSchema = z.object({
  zones_ids: z.array(z.string()).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
})

export const deleteNoteSchema = z.object({
  id: z.string()
})


export const updateNoteSchema = z.object({
  id: z.string(),
  zones_id: z.array(z.string()).optional(),
  params_ids: z.array(z.string()).optional(),
  content: z.string().max(200).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  type: types.optional(),
  tag: z.string().optional(),
})
