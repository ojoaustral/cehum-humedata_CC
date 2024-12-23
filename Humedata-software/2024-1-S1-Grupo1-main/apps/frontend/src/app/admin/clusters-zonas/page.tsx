"use client"
import React from "react"
import { Protect } from "@clerk/nextjs"
import ClustersTable from "./clusters-table"
import ZonesTable from "./zones-table"
import { trpc } from "@repo/trpc-client"
import { useAuth } from "@clerk/nextjs"

export default function ClustersZones() {
  const description = "Una organización puede tener varios clusters, y cada cluster puede tener varias zonas. Un cluster es el área donde se distribuyen las zonas. Una zona corresponde a un área más pequeña donde se encuentra el Humedat@."

  const { orgId } = useAuth()
  const { refetch: refetchZones } = trpc.zone.get.useQuery()
  const { data: orgs } = trpc.organization.get.useQuery()
  const organization = orgs?.find(org => org.orgId === orgId)

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
          <h1 className="font-bold">Clusters</h1>
          <ClustersTable orgId={organization?.id} onZoneRefetch={refetchZones} />
        </div>
        <div>
          <h1 className="font-bold">Zonas</h1>
          <ZonesTable />
        </div>
      </div>
    </Protect>
  )
}