import React, { useState } from "react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"

interface ClusterGet {
  id: string; // Cluster ID
  name: string; // Cluster name
  organizationId: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClusterUpdate {
  id: string;
  data: {
    name?: string; // Cluster name
    latitude?: number;
    longitude?: number;
  }
}

interface EditClusterFormProps {
  cluster: ClusterGet;
  onSave: (clusterUpdate: ClusterUpdate) => void;
  onCancel: () => void;
}

const EditClusterForm: React.FC<EditClusterFormProps> = ({ cluster, onSave, onCancel }) => {
  const [name, setName] = useState(cluster.name)
  const [latitude, setLatitude] = useState<string>(cluster.latitude?.toString() || "")
  const [longitude, setLongitude] = useState<string>(cluster.longitude?.toString() || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: cluster.id,
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    })
  }

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setLatitude(value)
    }
  }

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setLongitude(value)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="clusterName">Nombre cluster</label>
        <Input className="w-full" id="clusterName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4">
        <label htmlFor="clusterLatitude">Latitud (Ejemplo: -39.8173)</label>
        <Input className="w-full" id="clusterLatitude" value={latitude} onChange={handleLatitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="clusterLongitude">Longitud (Ejemplo: -73.2422)</label>
        <Input className="w-full" id="clusterLongitude" value={longitude} onChange={handleLongitudeChange} type="text" required />
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

export default EditClusterForm