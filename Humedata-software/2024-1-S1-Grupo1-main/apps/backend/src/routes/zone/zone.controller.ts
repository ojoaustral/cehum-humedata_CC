import { publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { z } from "zod"
import { createZoneSchema, updateZoneSchema, deleteZoneSchema }  from "./zone.schema"
import { externalVariables } from "../../utils/variablesDefinitions"

export const zoneController = t.router({
  get: publicEndpoint
    .query(async ({ ctx }) => {
      return await ctx.prismaMongo.zone.findMany()
    }),

  createZone: publicEndpoint
    .input(createZoneSchema)
    .mutation(async ({ ctx, input }) => {
      const newZone = await ctx.prismaMongo.zone.create({
        data: {
          name: input.name,
          locationId: input.locationId, 
          max_latitude: input.max_latitude,
          min_latitude: input.min_latitude,
          min_longitude: input.min_longitude,
          max_longitude: input.max_longitude,
        }
      })
      return newZone
    }),
  getZoneIds: publicEndpoint
    .query(async ({ ctx }) => {
      const zones = await ctx.prismaMongo.zone.findMany({
        select: {
          id: true,
        },
      })
      return zones.map(zone => zone.id)
    }),
  getParametersByZone: publicEndpoint
    .input(z.object({
      zones_id: z.array(z.string()),
    }))
    .query(async () => {
      const paramaersArray = Object.entries(externalVariables).map(([key, value]) => {
        return {
          id: key,
          name: value
        }
      })
      return { "parameters": paramaersArray }
    }),
  getZonesByLocation: publicEndpoint
    .input(z.object({
      organization: z.string(),
      location_name: z.string()
    }))
    .query(async ({ ctx, input }) => {

      const organizations = await ctx.prismaMongo.organization.findMany({
        where: {
          name: input.organization
        },
        select: {
          locations: true
        }
      }) 

      let zones_info: { zone_name: string, zone_id: string }[] = []

      await Promise.all(organizations.map(async (item) => {
        await Promise.all(item.locations.map(async (location) => {
          if(location.name == input.location_name){
            const zones_arr = await ctx.prismaMongo.location.findMany({
              where: {
                name: location.name
              },
              select: {
                zones: true
              }
            })
            zones_arr.forEach((zones) => {
              zones.zones.forEach((zone) => {
                zones_info.push({
                  zone_name: zone.name,
                  zone_id: zone.id
                })
              })
            })
          }
        }))
      }))

      return zones_info

    }),
  getMapData: publicEndpoint
    .query(async ({ ctx }) => {
      const zones_data = await ctx.prismaMongo.zone.findMany({
        select: {
          id: true,
          name: true,
          max_latitude: true,
          min_latitude: true,
          max_longitude: true,
          min_longitude: true,
          location: true,
          humedatas: true
        }
      })

      let response: { dev_id: string, dev_position: [number, number], zone_id: string,
            zone_name: string, zone_lat_max: number, zone_lat_min: number,
            zone_long_max: number, zone_long_min: number, location_name: string, 
            organization: string, imageUrl: string}[] = []

      for (const zone of zones_data) {

          
        if (zone !== null && zone.max_latitude !== null &&
            zone.min_latitude !== null && zone.max_longitude !== null &&
            zone.min_longitude !== null){

          const logs = await ctx.prismaCehum.logs.findFirst({
            where: {
              latitude: {
                gte: zone?.min_latitude,
                lte: zone?.max_latitude
              },
              longitude: {
                gte: zone?.min_longitude,
                lte: zone?.max_longitude
              },
            },
            select: {
              dev_id: true,
              latitude: true,
              longitude: true
            }
          })

          const organization_name = await ctx.prismaMongo.organization.findFirst({
            where: {
              id: zone.location.organizationId
            },
            select: {
              name: true
            }
          })

          let dev_id: { dev_eui: string | null; } | null = null

          if (logs !== null) {
            dev_id = await ctx.prismaCehum.humedata_devices.findFirst({
              where: {
                id: logs.dev_id
              },
              select: {
                dev_eui: true
              }
            })
          }

          if (dev_id !== null && organization_name !== null) {
            let newEntry = {
              dev_id: dev_id.dev_eui as string,  
              dev_position: [logs?.latitude, logs?.longitude] as [number, number], 
              zone_id: zone.id,  
              zone_name: zone.name, 
              zone_lat_max: zone.max_latitude,  
              zone_lat_min: zone.min_latitude,  
              zone_long_max: zone.max_longitude, 
              zone_long_min: zone.min_longitude,  
              location_name: zone.location.name, 
              organization: organization_name.name,
              imageUrl: "/assets/humedat@s.jpg" // TODO: Agregar field imageUrl a tabla
            }

            response.push(newEntry)
          }

        }
      }
      return response
    }),
  updateZone: publicEndpoint
    .input(z.object({
      id: z.string(), 
      data: updateZoneSchema, 
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input
      const updatedZone = await ctx.prismaMongo.zone.update({
        where: { id },
        data
      })
      return updatedZone
    }),

  deleteZone: publicEndpoint
    .input(deleteZoneSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      await ctx.prismaMongo.zone.delete({
        where: { id }
      })
      return { success: true, message: "Zone deleted successfully", id: id }
    }),
  
})
