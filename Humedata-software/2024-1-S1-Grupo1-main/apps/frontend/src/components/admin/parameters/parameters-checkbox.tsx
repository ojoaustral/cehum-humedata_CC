import React, { useState, useEffect } from "react"
import { Button } from "@ui/components/button"
import { Checkbox } from "@ui/components/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/popover"
import { trpc } from "@repo/trpc-client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@ui/components/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface Parameter {
  id: string;
  name: string;
}

interface ParamsCheckboxProps {
  onParameterChange: (selectedParams: string[]) => void;
  selectedZones: string[];
  disable: boolean;
}

const FormSchema = z.object({
  params: z.array(z.string()).refine((value) => value.some((param) => param), {
    message: "Debes seleccionar al menos un parámetro.",
  }),
})

const ParamsCheckbox: React.FC<ParamsCheckboxProps> = ({ onParameterChange, selectedZones, disable }) => {

  const [isAllSelected, setIsAllSelected] = useState<boolean>(true)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [showApplyReminder, setShowApplyReminder] = useState<boolean>(false)

  const { data: parameters } = trpc.zone.getParametersByZone.useQuery({ zones_id: selectedZones })

  const availableParameters: Parameter[] = parameters?.parameters || []

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      params: availableParameters.map(param => param.id),
    },
  })

  useEffect(() => {
    if (availableParameters.length > 0) {
      form.reset({
        params: availableParameters.map(param => param.id),
      })
    } 
  }, [availableParameters, form])

  useEffect(() => {
    setIsAllSelected(
      form.getValues("params").length === availableParameters.length
    )
  }, [form, availableParameters])

  function handleParameterChange(data: z.infer<typeof FormSchema>) {
    onParameterChange(data.params)
    setIsOpen(false)
    setShowApplyReminder(false)
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      form.setValue(
        "params",
        availableParameters.map(param => param.id)
      )
    } else {
      form.setValue("params", [])
    }
    setIsAllSelected(checked)
    setShowApplyReminder(true)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disable}>Selecciona parámetros</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleParameterChange)} className="space-y-8">
            <FormField
              control={form.control}
              name="params"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Parámetros</FormLabel>
                    <FormDescription>
                      Selecciona los parámetros.
                    </FormDescription>
                  </div>
                  <FormItem
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        className="data-[state=checked]:bg-primary border-primary"
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Seleccionar todos
                    </FormLabel>
                  </FormItem>
                  {availableParameters.map((param) => (
                    <FormField
                      key={param.id}
                      control={form.control}
                      name="params"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={param.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                className="data-[state=checked]:bg-primary border-primary"
                                checked={field.value?.includes(param.id)}
                                onCheckedChange={(checked) => {
                                  const updatedParams = checked
                                    ? [...field.value, param.id]
                                    : field.value.filter(
                                      (value) => value !== param.id
                                    )
                                  field.onChange(updatedParams)
                                  setIsAllSelected(
                                    updatedParams.length === availableParameters.length
                                  )
                                  setShowApplyReminder(true)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {param.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-primary text-white">Aplicar</Button>
            {showApplyReminder && (
              <div className="text-red-600 text-sm">Recuerda presionar "Aplicar" para guardar tu selección.</div>
            )}
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}

export default ParamsCheckbox
