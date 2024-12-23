import React, { useState } from "react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"

interface ClusterPost {
  name: string; // Cluster name
  organization: string; // Organization ID
  latitude: number;
  longitude: number;
}

interface AddClusterFormProps {
  orgId: string | null | undefined;
  onSave: (cluster: ClusterPost) => void;
}

const AddClusterForm: React.FC<AddClusterFormProps> = ({ onSave, orgId }) => {
  const [name, setName] = useState("")
  const [latitude, setLatitude] = useState<string>("")
  const [longitude, setLongitude] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name, 
      organization: orgId ? orgId : "",
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude) 
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
        <label htmlFor="clusterName">Nombre Cluster</label>
        <Input id="clusterName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4">
        <label htmlFor="clusterLatitude">Latitud (Ejemplo: -39.8173)</label>
        <Input id="clusterLatitude" value={latitude} onChange={handleLatitudeChange} type="text" required />
      </div>
      <div className="pt-4">
        <label htmlFor="clusterLongitude">Longitud (Ejemplo: -73.2422)</label>
        <Input id="clusterLongitude" value={longitude} onChange={handleLongitudeChange} type="text" required />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="outline" className="bg-secondary hover:bg-secondary/60 hover:text-white text-white">Añadir</Button>
      </div>
    </form>
  )
}

export default AddClusterForm