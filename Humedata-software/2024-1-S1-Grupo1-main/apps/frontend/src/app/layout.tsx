import "@ui/globals.css"
import { TrpcProvider } from "@/providers/trpc.provider"
import type { Metadata } from "next"
import { inter } from "./font"
import { ClerkProvider } from "@clerk/nextjs"
import { SyncActiveOrganization } from "@/components/sync-active-organization"
import { auth } from "@clerk/nextjs/server"
import NavbarSidebarLayout from "@/layouts/navbar-sidebar"
import { esES } from "@clerk/localizations"

export const metadata: Metadata = {
  title: "Humedat@",
  description: "Monitoreo costo-efectivo de calidad de aguas en tiempo real",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { sessionClaims } = auth()
  return (
    <ClerkProvider localization={esES}>
      <SyncActiveOrganization membership={sessionClaims?.membership} />
      <html lang="es">
        <body className={inter.className}>
          <TrpcProvider>
            <NavbarSidebarLayout>
              {children}
            </NavbarSidebarLayout>
          </TrpcProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
