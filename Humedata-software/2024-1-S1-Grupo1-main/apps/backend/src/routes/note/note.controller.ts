import { publicEndpoint, protectedEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { createNoteSchema, getNotesSchema, deleteNoteSchema, updateNoteSchema } from "./note.schema"
import { z } from "zod"
import { clerkClient } from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"

export const noteController = t.router({
  getAll: protectedEndpoint.query(async ({ ctx }) => {
    // Obtener la información del usuario
    const userData = await clerkClient.users.getUser(ctx.auth.userId)
    if (!userData) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })

    const orgInfo = await clerkClient.users.getOrganizationMembershipList({ userId: ctx.auth.userId })
    const hasOrganization = orgInfo && orgInfo.data.length > 0

    let role = "no role"
    if (hasOrganization) {
      role = orgInfo.data[0]?.role || "no role"
    }

    // Filtrar notas basadas en el rol
    let whereClause = {}
    if (role === "org:admin") {
      whereClause = { type: { in: ["public", "private"] } }
    } else if (role === "org:member") {
      whereClause = { type: "public" }
    }

    return await ctx.prismaMongo.notes.findMany({
      where: whereClause,
    })
  }),

  get: publicEndpoint
    .input(getNotesSchema)
    .query(async ({ ctx, input: { zones_ids, start_date, end_date } }) => {
      return await ctx.prismaMongo.notes.findMany({
        where: {
          ...(zones_ids && zones_ids?.length > 0 ? { zoneId: { in: zones_ids } } : {}),
          ...(start_date ? { start_date: { gte: start_date } } : {}),
          ...(end_date ? { end_date: { lte: end_date } } : {}),
        }
      })
    }),

  createNote: publicEndpoint
    .input(createNoteSchema)
    .mutation(async ({ ctx, input }) => {
      return await Promise.all(input.zones_id.map(async (zoneId) => {
        return await ctx.prismaMongo.notes.create({
          data: {
            zoneId: zoneId,
            content: input.content,
            start_date: input.start_date,
            end_date: input.end_date,
            type: input.type,
            tag: input.tag,
            params_id: input.params_ids,
            timestamp: new Date(),
          }
        })
      }))
    }),

  deleteNote: publicEndpoint
    .input(deleteNoteSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      return await ctx.prismaMongo.notes.delete({
        where: { id }
      })
    }),

  updateNote: publicEndpoint
    .input(updateNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const updatedNote = await ctx.prismaMongo.notes.update({
        where: { id },
        data: updateData,
      })

      return updatedNote
    }),
})
