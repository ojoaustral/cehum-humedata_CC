import { z } from "zod"

export const createLocationSchema = z.object({
  name: z.string(),
  organization: z.string().optional(),
  latitude: z.number(),
  longitude: z.number()
})

export const updateLocationSchema = z.object({
  name: z.string().optional(),
  organization: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export const deleteLocationSchema = z.object({
  id: z.string()
})
  
  