import { TRPCError } from "@trpc/server"
import { protectedEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { clerkClient } from "@clerk/clerk-sdk-node"
import { z } from "zod"

export const userController = t.router({
  getUser: protectedEndpoint.query(async ({ ctx }) => {
    const userData = await clerkClient.users.getUser(ctx.auth.userId)
    if (!userData) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })

    const orgInfo = await clerkClient.users.getOrganizationMembershipList({ userId: ctx.auth.userId })
    const hasOrganization = orgInfo && orgInfo.data.length > 0

    const { username, firstName, lastName, emailAddresses } = userData

    // Obtener solo el primer correo electrónico
    const firstEmailAddress = emailAddresses.length > 0 ? emailAddresses[0]?.emailAddress : null

    // Asegurar que organizationName y role siempre sean cadenas
    let organizationName: string = "no organization"
    let role: string = "no role"
    if (hasOrganization) {
      organizationName = orgInfo.data[0]?.organization.name || "no organization"
      role = orgInfo.data[0]?.role || "no role"
    }

    return {
      username,
      firstName,
      lastName,
      emailAddress: firstEmailAddress,
      organization: organizationName,
      role: role,
    }
  }),

  createUser: protectedEndpoint.input(z.object({
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.array(z.string().email()),
    password: z.string(),
  })).mutation(async ({ input }) => {
    return await clerkClient.users.createUser(input)
  }),

  getUserOrganization: protectedEndpoint.query(async ({ ctx }) => {
    const userId = ctx.auth.userId
    const response = await clerkClient.users.getOrganizationMembershipList({ userId })
    if (!response || response.data.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "User has no organization memberships" })

    const firstMembership = response.data[0]
    const role = firstMembership?.role
    const organization = firstMembership?.organization

    return {
      role,
      organization,
    }
  }),

  updateUser: protectedEndpoint.input(z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const userId = ctx.auth.userId
    const updatedUser = await clerkClient.users.updateUser(userId, input)

    return {
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      emailAddresses: updatedUser.emailAddresses,
    }
  }),
})