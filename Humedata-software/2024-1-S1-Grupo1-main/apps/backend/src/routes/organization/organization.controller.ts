import { publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { z } from "zod"

export const organizationController = t.router({
  get: publicEndpoint
    .query(async ({ ctx }) => {
      return await ctx.prismaMongo.organization.findMany()
    }),
  createOrganization: publicEndpoint
    .input(z.object({
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newOrganization = await ctx.prismaMongo.organization.create({
        data: {
          name: input.name,
        }
      })
      return newOrganization
    }),
  getOrganizationByName: publicEndpoint
    .input(z.object({
      name: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const organization = await ctx.prismaMongo.organization.findFirst({
        where: {
          name: input.name,
        },
      })
      return organization
    }),
  getLocations: publicEndpoint
    .input(z.object({
      organization: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (input.organization) {
        const organization = await ctx.prismaMongo.organization.findFirst({
          where: { name: input.organization },
        })

        if (!organization) {
          throw new Error("Organization not found")
        }

        const locations = await ctx.prismaMongo.location.findMany({
          where: { organizationId: organization.id },
        })

        return [{
          organization: organization.name,
          locations_names: locations.map(location => location.name),
        }]
      } else {
        const organizations = await ctx.prismaMongo.organization.findMany()
        
        const locationsByOrganization = await Promise.all(organizations.map(async org => {
          const locations = await ctx.prismaMongo.location.findMany({
            where: { organizationId: org.id },
          })
          return {
            organization: org.name,
            locations_names: locations.map(location => location.name),
          }
        }))

        return locationsByOrganization
      }
    }),
})
