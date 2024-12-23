import React, { useState } from "react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@ui/components/select"
import { trpc } from "@repo/trpc-client"

interface ZoneGet {
  id: string; // Zone ID
  name: string; // Zone name
  locationId: string; // Cluster ID
  max_latitude: number | null;
  max_longitude: number | null;
  min_latitude: number | null;
  min_longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Cluster {
  id: string; // Cluster ID
  name: string; // Cluster name
}

interface ZoneUpdate {
  id: string;
  data: {
    name?: string;
    locationId?: string;
    max_latitude?: number;
    max_longitude?: number;
    min_latitude?: number;
    min_longitude?: number;
  }
}

interface EditZoneFormProps {
  zone: ZoneGet;
  onSave: (zoneUpdate: ZoneUpdate) => void;
  onCancel: () => void;
}

const EditZoneForm: React.FC<EditZoneFormProps> = ({ zone, onSave, onCancel }) => {
  const [name, setName] = useState(zone.name)
  const [locationId, setLocationId] = useState(zone.locationId)
  const [maxLatitude, setMaxLatitude] = useState<string>(zone.max_latitude?.toString() || "")
  const [minLatitude, setMinLatitude] = useState<string>(zone.min_latitude?.toString() || "")
  const [maxLongitude, setMaxLongitude] = useState<string>(zone.max_longitude?.toString() || "")
  const [minLongitude, setMinLongitude] = useState<string>(zone.min_longitude?.toString() || "")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const { data: clusters, isError: isErrorClusters } = trpc.location.get.useQuery()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clusters?.find(cluster => cluster.id === locationId)) {
      setErrorMsg("ID de cluster no válido.")
      return
    }
    onSave({
      id: zone.id,
      data: {
        name,
        locationId,
        max_latitude: parseFloat(maxLatitude),
        min_latitude: parseFloat(minLatitude), 
        max_longitude: parseFloat(maxLongitude), 
        min_longitude: parseFloat(minLongitude)
      }
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
          <>
            <p className="text-red-600">Error al cargar los clusters disponibles.</p>
            {/* <Input id="locationId" value={locationId} onChange={(e) => setLocationId(e.target.value)} required /> */}
          </>
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
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}
      <div className="pt-4">
        <label htmlFor="zoneName">Nombre zona</label>
        <Input className="w-full" id="zoneName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMaxLatitude">Latitud máxima (Ejemplo: -39.83478203)</label>
        <Input className="w-full" id="zoneMaxLatitude" value={maxLatitude} onChange={handleMaxLatitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMinLatitude">Latitud mínima (Ejemplo: -39.83481797)</label>
        <Input className="w-full" id="zoneMinLatitude" value={minLatitude} onChange={handleMinLatitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMaxLongitude">Longitud máxima (Ejemplo: -73.23257664)</label>
        <Input className="w-full" id="zoneMaxLongitude" value={maxLongitude} onChange={handleMaxLongitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="zoneMinLongitude">Longitud mínima (Ejemplo: -73.23262336)</label>
        <Input className="w-full" id="zoneMinLongitude" value={minLongitude} onChange={handleMinLongitudeChange} type="text" required />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="mr-2 bg-gray-200 hover:bg-gray-300">
          Cancelar
        </Button>
        <Button type="submit" variant="outline" className="bg-secondary hover:bg-secondary/60 hover:text-white text-white">
          Guardar
        </Button>
      </div>
    </form>
  )
}

export default EditZoneForm