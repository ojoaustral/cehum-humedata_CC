import { TRPCError } from "@trpc/server"
import type { Middleware } from "../trpc"

const hasAdminRole = (userId: string) => {
  // Temporal has to be changed to real admin_user_id
  return userId === "admin_user_id" }

export const enforceAdmin = (middleware: Middleware) => middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  if (!hasAdminRole(ctx.auth.userId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" })
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  })
})