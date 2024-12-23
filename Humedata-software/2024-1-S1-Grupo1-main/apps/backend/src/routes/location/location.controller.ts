import { publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { createLocationSchema, updateLocationSchema, deleteLocationSchema } from "./location.schema"
import { z } from "zod"

export const locationController = t.router({
  get: publicEndpoint
    .query(async ({ ctx }) => {
      return await ctx.prismaMongo.location.findMany()
    }),
  createLocation: publicEndpoint
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prismaMongo.location.create({
        data: {
          name: input.name,
          organization: {
            connect: { id: input.organization }
          },
          latitude: input.latitude,
          longitude: input.longitude,
        }
      })
    }),
  updateLocation: publicEndpoint
    .input(z.object({
      id: z.string(),
      data: updateLocationSchema.omit({ organization: true })
    }))
    .mutation(async ({ ctx, input: { id, data } }) => {
      return await ctx.prismaMongo.location.update({
        where: { id },
        data
      })
    }),
  deleteLocation: publicEndpoint
    .input(deleteLocationSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      return await ctx.prismaMongo.location.delete({
        where: { id }
      })
    }),
})
