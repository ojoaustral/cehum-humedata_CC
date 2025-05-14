import React, { useState } from "react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"
import { NewVariablePost } from "@/types/variable"
import { Parameter, ParameterIdType, validParameterIds } from "@/types/parameters"
import Calculator from "./calculator"
import { Cluster } from "@/types/location"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui/components/select"
import { trpc } from "@repo/trpc-client"

interface AddNewVariableFormProps {
  locations: Cluster | undefined;
  onSave: (variable: NewVariablePost) => void;
}

const AddNewVariableForm: React.FC<AddNewVariableFormProps> = ({ locations, onSave }) => {
  const [name, setName] = useState("")
  const [selectedLocationName, setSelectedLocationName] = useState<string>("")
  const [locationId, setLocationId] = useState<string>("")
  const [formula, setFormula] = useState<string>("")
  const [params, setParams] = useState<string[]>([])

  const { data: zones } = trpc.zone.getZonesByLocation.useQuery({
    location_name: selectedLocationName,
    organization: locations?.organization || ""
  })

  const { data: parameters } = trpc.zone.getParametersByZone.useQuery({
    zones_id: zones?.map((zone) => zone.zone_id) || []
  })

  const { data: lctions } = trpc.location.get.useQuery()
  

  const handleEraseClick = (value: string) => {

    const new_formula = value || ""
    
    if (new_formula === "") {
      // Borrar Todo
      setFormula("")
      setParams([])
    }
    else {
      // Borrar

      const last_char = new_formula.substring(new_formula.length - 1)
      

      // Borrar número
      if (!isNaN(+last_char) || ["+", "-", "*", "/", "(", ")", "^"].includes(last_char)) {
        let result_formula = formula.substring(0, formula.length - 1)
        if (result_formula.substring(new_formula.length - 1) === " ") {
          setFormula(result_formula.substring(0, result_formula.length - 1))
        }
        else {
          setFormula(formula.substring(0, formula.length - 1))
        }
      }
      else {
        // Borrar parámetro
        
        let index = new_formula.length - 1

        while (/^[a-zA-Z_]+$/.test(new_formula.substring(index)) && index > 0) {
          index = index - 1
        }
        setFormula(new_formula.substring(0, index))
        console.log("A borrar param: " + new_formula.substring(index).replaceAll(" ", "") + "!")
        const new_params = validParameterIds.filter((vp) => new_formula.substring(0, index).includes(vp))
        setParams(new_params)
      }
    }
  }


  const handleParamClick = (value: string) => {
    const new_formula = formula + value + " "
    setFormula(new_formula.replaceAll("  ", " "))
    if (value in params) {
      
    }
    else {
      if (params.includes(value)) {
        // Do nothing. Ya existe en el array
      }
      else {
        setParams(params.concat([value]))
      }
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const typedParameterIds = params.filter((id): id is ParameterIdType => params.includes(id as ParameterIdType))

    onSave({
      name,
      location_name: selectedLocationName,
      location_id: lctions?.find((lction) => lction.name === selectedLocationName)?.id || "",
      formula,
      params: typedParameterIds,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="newVariableName">Nombre Variable</label>
        <Input id="newVariableName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4">
        <label htmlFor="newVariableLocationId">Cluster</label>
        <Select
          value={selectedLocationName}
          onValueChange={(value: string) => setSelectedLocationName(value)}
        >
          <SelectTrigger className="focus:ring-transparent">
            <SelectValue placeholder="Elige un cluster" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Clusters</SelectLabel>
              {lctions?.map(
                (location) => (
                  <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <label htmlFor="newVariableFormula">Fórmula</label>
        <Input className=" overflow-scroll mb-2" id="newVariableFormula" autoComplete="off" value={formula} onChange={() => {}} type="text" required />
        <Calculator formula={formula} setFormula={setFormula} handleEraseClick={handleEraseClick} handleParamClick={handleParamClick} params={selectedLocationName && parameters?.parameters || []}></Calculator>
      </div>


      <div className="flex justify-end pt-4">
        <Button type="submit" variant="outline" className="bg-secondary hover:bg-secondary/60 hover:text-white text-white">Añadir</Button>
      </div>
    </form>
  )
}

export default AddNewVariableForm