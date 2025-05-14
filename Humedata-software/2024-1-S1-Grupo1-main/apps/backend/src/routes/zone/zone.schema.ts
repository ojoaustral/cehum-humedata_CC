import { z } from "zod"

export const createZoneSchema = z.object({
  name: z.string(),
  locationId: z.string(), 
  min_latitude: z.number(),
  max_latitude: z.number(),
  min_longitude: z.number(),
  max_longitude: z.number(),
})

export const updateZoneSchema = z.object({
  name: z.string().optional(),
  locationId: z.string().optional(), 
  min_latitude: z.number().optional(),
  max_latitude: z.number().optional(),
  min_longitude: z.number().optional(),
  max_longitude: z.number().optional(),
})

export const deleteZoneSchema = z.object({
  id: z.string()
})
