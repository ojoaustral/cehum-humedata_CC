"use client"
import React from "react"
import { Protect, useAuth } from "@clerk/nextjs"
import { trpc } from "@repo/trpc-client"
import NewVariablesTable from "./variables-table"

export default function Page() {

  const { orgId } = useAuth()

  const description = "Una zona puede tener variables creadas a partir de fórmulas matemáticas que involucren a los parámetros disponibles en la zona."

  const { refetch: refetchZones } = trpc.variable.get.useQuery()
  const { data: orgs } = trpc.organization.get.useQuery()
  const organization = orgs?.find(org => org.orgId === orgId)

  const { data: locations } = trpc.organization.getLocations.useQuery({
    organization: organization?.name
  })

  return (
    <Protect role="org:admin">
      <div className="flex flex-col gap-10">
        <div className="max-w-[50%] border border-primary p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-l font-bold mb-2">Descripción</h2>
          </div>
          <p>{description}</p>
        </div>
        <div>
          <h1 className="font-bold">Organización {organization?.name} (ID: {organization?.id})</h1>
        </div>
        <div>
          <h1 className="font-bold">Variables</h1>
          {/* Se entrega locations?.at(0) porque el endpoint retorna un array de locations */}
          <NewVariablesTable locations={locations?.at(0)} onNewVariableRefetch={refetchZones} />
        </div>
      </div>
    </Protect>
  )
}