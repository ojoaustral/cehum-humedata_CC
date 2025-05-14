import { publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const deviceController = t.router({
  getAllDevicesIds: publicEndpoint
    .query(async ({ ctx }) => {
      return (await ctx.prismaCehum.humedata_devices.findMany()).map(device => device.dev_eui)
    }),

  getDeviceDetails: publicEndpoint
    .input(z.object({
      devId: z.number()
    }))
    .query(async ({ input, ctx }) => {
      const humedataDevice = await ctx.prismaCehum.humedata_devices.findFirst({
        where: { id: input.devId }
      })
      

      if (!humedataDevice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Humedata Device not found in CEHUM Database",
        })
      }

      const humedata = await ctx.prismaMongo.humedata.findFirst({
        where: { id: input.devId.toString() },
      })

      if (!humedata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Humedata not found",
        })
      }

      const zone = await ctx.prismaMongo.zone.findUnique({
        where: { id: humedata.zoneId }
      })

      if (!zone) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Zone not found",
        })
      }

      const location = await ctx.prismaMongo.location.findUnique({
        where: { id: zone.locationId }
      })

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        })
      }

      const organization = await ctx.prismaMongo.organization.findUnique({
        where: { id: location.organizationId }
      })

      if (!organization) {
        throw new Error("Organization not found")
      }

      const logs = await ctx.prismaCehum.logs.findMany({
        where: {
          dev_id: humedataDevice.id,
        },
        select: {
          latitude: true,
          longitude: true,
        },
        take: 1 
      })

      if(logs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No logs found for the specified device",
        })
      }
      
      return {
        dev_id: humedataDevice.dev_eui,
        dev_position: [logs[0]?.latitude, logs[0]?.longitude],
        zone_id: zone.id,
        zone_name: zone.name,
        zone_lat_max: zone.max_latitude,
        zone_lat_min: zone.min_latitude,
        zone_long_max: zone.max_longitude,
        zone_long_min: zone.min_longitude,
        location_name: location.name,
        organization: organization.name,
        imageUrl:  "/assets/humedat@s.jpg" // TO DO: implementar campo de imagen en schema
      }
    })
})
