import { publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { z } from "zod"
import { traduccionesDeVariables } from "../../utils/variablesDefinitions"
  
export const zoneTimeSeriesController = t.router({
  getTimeSeriesByZones: publicEndpoint
    .input(z.object({
      zones_id: z.array(z.string()),
      start_date: z.date(),
      end_date: z.date(),
      parameters: z.array(z.string()),
      transform: z.boolean().optional().default(true)
    }))
    .query(async ({ ctx, input }) => {
      if(!input.zones_id.length) throw new Error("Zone ID array is empty")
      if(!input.parameters.length) throw new Error("Parameter array is empty")

      const zones = await ctx.prismaMongo.zone.findMany({
        where: {
          id: {
            in:input.zones_id,
          },
        }
      }) 

      input.parameters.push("battery_level","internal_humidity","internal_pressure","internal_temperature")

      const transformedLogs: { [key: string]: any } = {}

      for (const parameter of input.parameters) {
        transformedLogs[parameter] = {}
        transformedLogs[parameter]["name"] =  traduccionesDeVariables[parameter]
        transformedLogs[parameter]["id"] = parameter
        transformedLogs[parameter]["data"] = {}
        for (const zone of zones) {
          if (zone !== null && zone.max_latitude !== null &&
          zone.min_latitude !== null && zone.max_longitude !== null &&
          zone.min_longitude !== null){

            const logs = await ctx.prismaCehum.logs.findMany({
              where: {
                latitude: {
                  gte: zone?.min_latitude,
                  lte: zone?.max_latitude
                },
                longitude: {
                  gte: zone?.min_longitude,
                  lte: zone?.max_longitude
                },
                timestamp: {
                  gte: input.start_date,
                  lte: input.end_date
                }
              },
              select: {
                timestamp: true,
                [parameter]: true, 
              }
            })
            transformedLogs[parameter]["data"][zone.id] = logs
          }
        }
      }
      return transformedLogs
    }),
})
