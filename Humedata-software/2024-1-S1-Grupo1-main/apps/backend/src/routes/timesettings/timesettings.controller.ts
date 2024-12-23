import { publicEndpoint } from "../../endpoints"
import { t } from "../../trpc"
import { z } from "zod"

// THIS WILL NOT WORK ON PRODUCTION
let applyDST = true

export const timeSettingsController = t.router({
  setApplyDST: publicEndpoint
    .input(z.object({
      applyDST: z.boolean()
    }))
    .mutation(async ({ input }) => {
      applyDST = input.applyDST
      return { applyDST }
    }),
  getApplyDST: publicEndpoint
    .query(async () => {
      return { applyDST }
    })
})
