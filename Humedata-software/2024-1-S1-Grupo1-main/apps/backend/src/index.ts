import "dotenv/config"
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node"
import * as trpcExpress from "@trpc/server/adapters/express"
import { createContext } from "./context"
import { appRouter } from "./router"
import { PORT } from "./config"
import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(ClerkExpressWithAuth())
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      if(process.env.NODE_ENV === "development") {
        console.error(error)
      }
    }
  })
)

// WE SHOULD NOT INCLUDE NEW ROUTES HERE, IF WE WANT TO TEST THEM, WE SHOULD CREATE A JEST TEST FILE

app.listen(PORT, () => console.log(`Express server is listening on PORT ${PORT}!`))

export default app
