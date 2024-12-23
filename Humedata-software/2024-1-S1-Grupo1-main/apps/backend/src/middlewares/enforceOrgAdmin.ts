import { TRPCError } from "@trpc/server"
import type { Middleware } from "../trpc"


export const enforceOrgAdmin = (middleware: Middleware) => middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  if (!(ctx.auth.orgRole == "Admin")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" })
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  })
})