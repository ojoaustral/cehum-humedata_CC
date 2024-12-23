"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppRouter, PORT, PRODUCTION_URL } from "@backend/config"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import { useMemo, useState } from "react"
import superjson from "superjson"

const IS_DEV = process.env.NODE_ENV === "development"
const IS_PROD_MOBILE = process.env.IS_PROD_MOBILE === "true"
const FRONT_URL = `${IS_DEV ? `http://localhost:${PORT}` : PRODUCTION_URL}/trpc/`
const TRPC_URL = IS_PROD_MOBILE ? `${PRODUCTION_URL}/trpc` : FRONT_URL
export const trpc = createTRPCReact<AppRouter>()

export const TrpcProvider: React.FC<{ token?: string, children?: React.ReactNode }> = ({
  token,
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { 
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 15 * 60 * 1000 
          } 
        },
      })
  )

  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [
        loggerLink({
          enabled: () => process.env.NODE_ENV === "development",
        }),
        httpBatchLink({
          transformer: superjson,
          url: TRPC_URL,
          headers: () => {
            if(token) {
              return {
                Authorization: `Bearer ${token}`,
              }
            }
            return {}
          }
        }),
      ],
    })
  }, [token])

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
