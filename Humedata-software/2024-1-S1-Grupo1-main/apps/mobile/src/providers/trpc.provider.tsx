"use client"
import { TrpcProvider as Trpc } from "@trpc-client/index"
import { FC, ReactNode, useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-expo"

export const TrpcProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const { userId, getToken } = useAuth()
  const [token, setToken] = useState<string>()

  useEffect(() => {
    (async () => {
      if(userId) {
        const tk = await getToken()
        if(tk) setToken(tk)
      }
    })()
  }, [userId])

  return (
    <Trpc token={token}>
      {children}
    </Trpc>
  )
}
