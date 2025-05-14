import React, { useEffect, useState } from "react"
import { Input } from "@ui/components/input"
import { Button } from "@ui/components/button"
import { NewVariableGet, NewVariablePost, NewVariableUpdate } from "@/types/variable"
import { Parameter, ParameterIdType, validParameterIds } from "@/types/parameters"
import Calculator from "./calculator"
import { Cluster } from "@/types/location"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui/components/select"
import { trpc } from "@repo/trpc-client"

interface EditNewVariableFormProps {
  locations: Cluster | undefined;
  newVariable: NewVariableGet;
  onSave: (newVariableUpdate: NewVariableUpdate) => void;
  onCancel: () => void;
}

const EditNewVariableForm: React.FC<EditNewVariableFormProps> = ({ locations, newVariable, onSave, onCancel }) => {
  // const [locationName, setLocationName] = useState<string>("")
  const { data: lctions, isLoading } = trpc.location.get.useQuery()

  const [name, setName] = useState(newVariable.name || "")
  const [selectedLocationName, setSelectedLocationName] = useState<string>(lctions?.find((lction) => lction.id === newVariable.locationId)?.name || "")
  const [locationId, setLocationId] = useState<string>(newVariable.locationId || "")
  const [formula, setFormula] = useState<string>(newVariable.formula || "")
  const [params, setParams] = useState<string[]>(newVariable.params || [])

  const { data: zones } = trpc.zone.getZonesByLocation.useQuery({
    location_name: selectedLocationName,
    organization: locations?.organization || ""
  })

  const { data: parameters } = trpc.zone.getParametersByZone.useQuery({
    zones_id: zones?.map((zone) => zone.zone_id) || []
  })

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

  useEffect(() => {
    if (!isLoading) {
      setSelectedLocationName(lctions?.find((lction) => lction.id === newVariable.locationId)?.name || "")
    }
  }, [isLoading])

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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const typedParameterIds = params.filter((id): id is ParameterIdType => params.includes(id as ParameterIdType))
    
    onSave({
      variable_id: newVariable.id,
      location_id: lctions?.find((lction) => lction.name === selectedLocationName)?.id || "",
      name,
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

export default EditNewVariableForm