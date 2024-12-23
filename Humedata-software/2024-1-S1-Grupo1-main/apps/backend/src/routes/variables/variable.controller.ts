import { publicEndpoint } from "../../endpoints"
import type { ZoneData, VariableData } from "./variable.schema"
import { t } from "../../trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { Parser } from "expr-eval"

export const variableController = t.router({
  get: publicEndpoint
    .query(async ({ ctx }) => {
      return await ctx.prismaMongo.variable.findMany()
    }),
  createVariable: publicEndpoint
    .input(z.object({
      location_name: z.string(),
      location_id: z.string(),
      formula: z.string(),
      name: z.string(),    
      params: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const newVariable = await ctx.prismaMongo.variable.create({
        data: {
          location: {
            connect: {
              id: input.location_id
            }
          },
          formula: input.formula,
          params: input.params,
          name: input.name
        }
      })
      return newVariable
    }),

  updateVariable: publicEndpoint
    .input(z.object({
      variable_id: z.string(),
      location_id: z.string(),
      formula: z.string().optional(),
      name: z.string().optional(),    
      params: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prismaMongo.variable.update({
        where: {
          id: input.variable_id,
        },
        data: {
          location: {
            connect: {
              id: input.location_id
            }
          },
          formula: input.formula,
          params: input.params,
          name: input.name
        }
      })
    }),
  deleteVariable: publicEndpoint
    .input(z.object({
      variable_id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prismaMongo.variable.delete({
        where: {
          id: input.variable_id,
        }
      })
    }),
  getVariableByZone: publicEndpoint
    .input(z.object({
      zone_id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const zone = await ctx.prismaMongo.zone.findUnique({
        where: {
          id: input.zone_id
        }
      }) 
      const variables = await ctx.prismaMongo.variable.findMany({
        where: {
          location: {
            id: zone?.locationId
          },
        },
      })
      return variables
    }),
  getTimeSeriesByVariable: publicEndpoint
    .input(z.object({
      zones_id: z.array(z.string()),
      start_date: z.date(),
      end_date: z.date(),
      variables: z.array(z.string())
    }))
    .query(async ({ ctx,input }) => {

      const variables = await ctx.prismaMongo.variable.findMany({
        where: {
          id: { in: input.variables }
        }
      })

      if(variables.length !== input.variables.length) throw new TRPCError({ code: "NOT_FOUND", message: "Variable not found" })

      const zones = await ctx.prismaMongo.zone.findMany({
        where: {
          id: { in: input.zones_id }
        }
      })

      const newVariables = await variables.reduce<Promise<VariableData>>(async (objPromise, variable) => {
        const obj = await objPromise
        const newLogs = await zones.reduce<Promise<ZoneData>>(async (objPromise, zone) => {
          const obj = await objPromise
          const logs = await ctx.prismaCehum.logs.findMany({
            where: {
              latitude: {
                gte: zone?.min_latitude ?? 0,
                lte: zone?.max_latitude ?? 0
              },
              longitude: {
                gte: zone?.min_longitude ?? 0,
                lte: zone?.max_longitude ?? 0
              },
              timestamp: {
                gte: input.start_date,
                lte: input.end_date
              }
            },
          })

          const data = logs.map(log => {
            const params = variable.params.reduce<Record<string, number>>((paramObj, param) => {
              return {
                ...paramObj,
                [param]: log[param as keyof typeof log] as number
              }
            }, {})

            return {
              timestamp: log.timestamp,
              [variable.id]: Parser.evaluate(variable.formula.replace(/\$/g, ""), params)
            }
          })

          return {
            ...obj,
            [zone.id]: data
          }
        }, Promise.resolve({}))

        return {
          ...obj,
          [variable.id]: {
            name: variable.name,
            id: variable.id,
            data: newLogs
          }
        }
      }, Promise.resolve({}))
      return newVariables
    })
})
