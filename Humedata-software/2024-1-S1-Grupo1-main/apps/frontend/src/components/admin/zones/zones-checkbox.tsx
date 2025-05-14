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

interface Zone {
  zone_name: string,
  zone_id: string
}

interface ZonesCheckboxProps {
  onZoneChange: (selectedZones: string[]) => void;
  cluster: {
    name: string,
    organizationName: string
  };
  disable: boolean;
}

const FormSchema = z.object({
  zones: z.array(z.string()).refine((value) => value.some((zone) => zone), {
    message: "Debes seleccionar al menos una zona.",
  }),
})

const ZonesCheckbox: React.FC<ZonesCheckboxProps> = ({ onZoneChange, cluster, disable }) => {

  const { data: zones } = trpc.zone.getZonesByLocation.useQuery({ organization: cluster.organizationName, location_name: cluster.name })

  const [isAllSelected, setIsAllSelected] = useState<boolean>(true)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [showApplyReminder, setShowApplyReminder] = useState<boolean>(false)

  const availableZones: Zone[] = zones || []

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      zones: availableZones.map(zone => zone.zone_id),
    },
  })

  useEffect(() => {
    if (availableZones.length > 0) {
      form.reset({
        zones: availableZones.map(zone => zone.zone_id),
      })
    } 
  }, [availableZones, form])

  useEffect(() => {
    setIsAllSelected(
      form.getValues("zones").length === availableZones.length
    )
  }, [form, availableZones])

  function handleZoneChange(data: z.infer<typeof FormSchema>) {
    onZoneChange(data.zones)
    setIsOpen(false)
    setShowApplyReminder(false)
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      form.setValue(
        "zones",
        availableZones.map(zone => zone.zone_id)
      )
    } else {
      form.setValue("zones", [])
    }
    setIsAllSelected(checked)
    setShowApplyReminder(true)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="mr-5" variant="outline" disabled={disable}>Selecciona zonas</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleZoneChange)} className="space-y-8">
            <FormField
              control={form.control}
              name="zones"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Zonas</FormLabel>
                    <FormDescription>
                      Selecciona las zonas.
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
                  {availableZones.map((zone) => (
                    <FormField
                      key={zone.zone_id}
                      control={form.control}
                      name="zones"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={zone.zone_id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                className="data-[state=checked]:bg-primary border-primary"
                                checked={field.value?.includes(zone.zone_id)}
                                onCheckedChange={(checked) => {
                                  const updatedZones = checked
                                    ? [...field.value, zone.zone_id]
                                    : field.value.filter(
                                      (value) => value !== zone.zone_id
                                    )
                                  field.onChange(updatedZones)
                                  setIsAllSelected(
                                    updatedZones.length === availableZones.length
                                  )
                                  setShowApplyReminder(true)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {zone.zone_name}
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

export default ZonesCheckbox
