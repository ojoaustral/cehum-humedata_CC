import React, { useState } from "react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@ui/components/select"
import { trpc } from "@repo/trpc-client"

interface ZonePost {
  name: string; // Zone name
  locationId: string; // Cluster ID
  max_latitude: number;
  max_longitude: number;
  min_latitude: number;
  min_longitude: number;
}

interface AddZoneFormProps {
  onSave: (zone: ZonePost) => void;
}

interface Cluster {
  id: string; // Cluster ID
  name: string; // Cluster name
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({ onSave }) => {
  const [name, setName] = useState("")
  const [locationId, setLocationId] = useState("")
  const [maxLatitude, setMaxLatitude] = useState<string>("")
  const [minLatitude, setMinLatitude] = useState<string>("")
  const [maxLongitude, setMaxLongitude] = useState<string>("")
  const [minLongitude, setMinLongitude] = useState<string>("")

  const { data: clusters, isError: isErrorClusters } = trpc.location.get.useQuery()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name, 
      locationId, 
      max_latitude: parseFloat(maxLatitude),
      min_latitude: parseFloat(minLatitude), 
      max_longitude: parseFloat(maxLongitude), 
      min_longitude: parseFloat(minLongitude)
    })
  }

  const handleMaxLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setMaxLatitude(value)
    }
  }

  const handleMinLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setMinLatitude(value)
    }
  }

  const handleMaxLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setMaxLongitude(value)
    }
  }

  const handleMinLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setMinLongitude(value)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="locationId">Cluster ID</label>
        {isErrorClusters ? (
          <p className="text-sm">Error al cargar los clusters existentes.</p>
        ) : (
          <Select value={locationId} onValueChange={(value) => setLocationId(value)}>
            <SelectTrigger className="w-full ml-0 mt-1 focus:ring-transparent" id="locationId">
              <SelectValue placeholder="Selecciona un cluster" />
            </SelectTrigger>
            <SelectContent>
              {clusters?.map((cluster: Cluster) => (
                <SelectItem key={cluster.id} value={cluster.id}>
                  {cluster.name} (ID: {cluster.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="pt-4">
        <label htmlFor="zoneName">Nombre Zona</label>
        <Input className="w-full" id="zoneName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMaxLatitude">Latitud Máxima (Ejemplo: -39.83478203)</label>
        <Input className="w-full" id="zoneMaxLatitude" value={maxLatitude} onChange={handleMaxLatitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMinLatitude">Latitud Mínima (Ejemplo: -39.83481797)</label>
        <Input className="w-full" id="zoneMinLatitude" value={minLatitude} onChange={handleMinLatitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMaxLongitude">Longitud Máxima (Ejemplo: -73.23257664)</label>
        <Input className="w-full" id="zoneMaxLongitude" value={maxLongitude} onChange={handleMaxLongitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMinLongitude">Longitud Mínima (Ejemplo: -73.23262336)</label>
        <Input className="w-full" id="zoneMinLongitude" value={minLongitude} onChange={handleMinLongitudeChange} type="text" required />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="outline" className="bg-secondary hover:bg-secondary/60 hover:text-white text-white">Añadir</Button>
      </div>
    </form>
  )
}

export default AddZoneForm