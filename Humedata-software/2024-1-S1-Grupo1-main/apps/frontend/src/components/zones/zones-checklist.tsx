"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@ui/components/button"
import { Checkbox } from "@ui/components/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/popover"
import { Dialog, DialogContent, DialogTrigger } from "@ui/components/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui/components/select"
import { trpc } from "@repo/trpc-client"

interface ZonesChecklistProps {
  onSelectCluster: (cluster: string) => void;
}

const ZonesChecklist: React.FC<ZonesChecklistProps> = ({ onSelectCluster }) => {
  const router = useRouter()
  const [selectedZones, setSelectedZones] = useState<{ name: string; zone_id: string }[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState<string>("")
  const [zoneParams, setZoneParams] = useState<{ organization: string, location_name: string } | null>(null)

  const { data: organizations, isLoading: organizationLoading, isError: organizationError } = trpc.organization.getLocations.useQuery({ organization: "" })

  const { data: zones, refetch } = trpc.zone.getZonesByLocation.useQuery(
    zoneParams ?? { organization: "", location_name: "" },
    { enabled: Boolean(zoneParams) }
  )

  const { data: locations, isLoading: Loading, isError: Error } = trpc.location.get.useQuery()

  const handleClusterChange = (value: string) => {
    const [org, cluster] = value.split("-")
    if (cluster && org) {
      onSelectCluster(cluster)
      setSelectedCluster(value)
      setSelectedZones([])
      setZoneParams({ organization: org, location_name: cluster })
    }
  }

  useEffect(() => {
    if (zoneParams) {
      refetch()
    }
  }, [zoneParams, refetch])

  const handleZoneChange = (zone: { name: string; zone_id: string }) => {
    setSelectedZones((prevZones) => {
      if (prevZones.some((z) => z.name === zone.name)) {
        return prevZones.filter((z) => z.name !== zone.name)
      } else {
        return [...prevZones, zone]
      }
    })
  }

  const handleSelectZonas = () => {
    const ids = selectedZones.map((zone) => zone.zone_id)
    const url = ids.length === 1 ? `/zona/${ids[0]}` : `/zonas/${ids.join("-")}`
    router.push(url)
  }

  const closeModal = () => {
    setIsOpen(false)
    setIsDialogOpen(false)
  }

  return (
    <div className="flex justify-start mx-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="text-base">Seleccionar Clusters</Button>
        </DialogTrigger>
        <DialogContent className="text-lg flex flex-col items-center">
          <SelectGroup className="w-72 mt-5 mb-2 flex flex-col items-center">
            <SelectLabel>Seleccionar Cluster</SelectLabel>
            <Select onValueChange={handleClusterChange} value={selectedCluster}>
              <SelectTrigger className="w-44 focus:ring-transparent">
                <SelectValue placeholder="Select cluster" />
              </SelectTrigger>
              <SelectContent>
                {(organizations ?? []).map((org, index) => (
                  <div key={`${org.organization}-${index}`}>
                    <h1 className="text-l font-bold">{org.organization}</h1>
                    {org.locations_names.map((cluster) => (
                      <SelectItem key={`${org.organization}-${cluster}`} value={`${org.organization}-${cluster}`}>
                        {cluster}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </SelectGroup>

          {selectedCluster && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mb-5">Seleccionar múltiples zonas</Button>
              </PopoverTrigger>
              {/* <Button onClick={closeModal} className="mt-5 text-lg">Ver cluster</Button> */}
              <PopoverContent className="w-80 flex flex-col">
                {zones && zones.length > 0 ? (
                  zones.map((zone) => (
                    <div key={zone.zone_id} className="flex items-center">
                      <Checkbox
                        className="data-[state=checked]:bg-primary border-primary"
                        checked={selectedZones.some((z) => z.name === zone.zone_name)}
                        onCheckedChange={() => handleZoneChange({ name: zone.zone_name, zone_id: zone.zone_id })}
                      />
                      <span className="ml-2">{zone.zone_name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm">No hay zonas en el cluster seleccionado.</div>
                )}
                {zones && zones.length > 0 && <Button onClick={handleSelectZonas} className="mt-5 text-base">Ver múltiples zonas</Button>}
              </PopoverContent>
            </Popover>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ZonesChecklist