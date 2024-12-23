import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { PrismaClient as CehumClient } from "./generated/cehum-client"
import { PrismaClient as MongoClient } from "./generated/mongo-client"
import { WithAuthProp } from "@clerk/clerk-sdk-node"
import { AuthObject } from "./types/clerk"
import { Request } from "express"

export const prismaCehum = new CehumClient()
export const prismaMongo = new MongoClient()

export const createContext = ({ req }: CreateExpressContextOptions) => {
  const auth: AuthObject = (req as WithAuthProp<Request>).auth
  return {
    auth,
    prismaCehum,
    prismaMongo,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>