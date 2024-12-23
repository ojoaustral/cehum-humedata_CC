import { createDownloadRecordSchema, downloadRecordSchema } from "./downloadrecord.schema"
import { protectedEndpoint, publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { z } from "zod"
import { clerkClient } from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"

export const downloadRecordController = t.router({
  get: publicEndpoint
    .input(z.object({
      organization: z.string().optional()
    }))
    .query(async ({ ctx, input: { organization } }) => {
      return await ctx.prismaMongo.downloadRecord.findMany({
        where: {
          ...(organization ? { organization: organization } : {})
        }
      })
    }),

  getAll: publicEndpoint
    .query(async ({ ctx }) => {
      return await ctx.prismaMongo.downloadRecord.findMany()
    }),

  createDownloadRecord: publicEndpoint
    .input(createDownloadRecordSchema)
    .mutation(async ({ ctx, input }) => {
      let userId = null
      let userMail = "usuario no registrado"
      let organization = "No organización"

      if (ctx.auth && ctx.auth.userId) {
        const userData = await clerkClient.users.getUser(ctx.auth.userId)
        if (!userData) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })

        const orgInfo = await clerkClient.users.getOrganizationMembershipList({ userId: ctx.auth.userId })
        const hasOrganization = orgInfo && orgInfo.data.length > 0

        const { emailAddresses } = userData
        const firstEmailAddress = emailAddresses.length > 0 ? emailAddresses[0]?.emailAddress : "unknown@example.com"

        if (hasOrganization) {
          organization = orgInfo.data[0]?.organization.name || "no organization"
        }

        userId = ctx.auth.userId
        userMail = firstEmailAddress || "unknown@example.com"
      }

      const downloadRecords = await Promise.all(
        input.zones_id.map(async (zoneId: string) => {
          const downloadRecordData = {
            userId: userId,
            user_mail: userMail,
            organization: organization,
            zones_id: [zoneId],
            location_name: input.location_name,
            params_id: input.params_id,
            start_date: input.start_date,
            end_date: input.end_date,
            download_date: new Date()
          }
          const downloadRecord = await ctx.prismaMongo.downloadRecord.create({
            data: downloadRecordData
          })
          return downloadRecordSchema.parse(downloadRecord)
        })
      )
      return downloadRecords
    }),
})
