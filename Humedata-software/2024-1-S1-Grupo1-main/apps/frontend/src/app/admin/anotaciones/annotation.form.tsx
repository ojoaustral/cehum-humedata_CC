"use client"
import { useForm } from "react-hook-form"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { formatDateToISO } from "@/hooks/date-to-string-format"
import { cn } from "@ui/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@ui/components/form"
import { trpc } from "@repo/trpc-client"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"
import { formSchema, FormSchema } from "./annotation.schema"
import ParamsCheckbox from "@/components/admin/parameters/parameters-checkbox"
import ZonesCheckbox from "@/components/admin/zones/zones-checkbox"
import { useAuth } from "@clerk/nextjs"

interface AnnotationFormProps {
  refetchTable: () => void
}

const AnnotationForm: React.FC<AnnotationFormProps> = ( { refetchTable } ) => {
  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resetDates, setResetDates] = useState<boolean>(false)

  const { orgId } = useAuth()
  const { data: organizations, isError: isErrorOrg } = trpc.organization.get.useQuery()
  const org_of_admin = organizations?.find(org => org.orgId === orgId)
  const { data: clustersOrg, isLoading: clustersOrgLoading, isError: clustersOrgError } = trpc.organization.getLocations.useQuery({ organization: org_of_admin?.name })

  const annotationMutation = trpc.note.createNote.useMutation()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annotation: "",
      tag: "",
      type: "public",
      date: {
        from: undefined,
        to: undefined,
      },
      clusterName: "",
      selectedZones: [],
      selectedParams: [],
      privateOption: "",
    },
  })

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (date) {
      form.setValue("date.from", date)
    }
  }

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (date) {
      form.setValue("date.to", date)
    }
  }

  const handleClusterChange = (value: string) => {
    form.setValue("clusterName", value)
    form.setValue("selectedZones", [])
    form.setValue("selectedParams", [])
  }

  const handleZonesChange = (zones: string[]) => {
    form.setValue("selectedZones", zones)
    form.setValue("selectedParams", [])
  }

  const handleParamsChange = (params: string[]) => {
    form.setValue("selectedParams", params)
  }

  function onSubmit(values: FormSchema) {
    // Handle submit
    if (values.clusterName && values.selectedZones.length > 0 && values.selectedParams.length > 0) {
      annotationMutation.mutate({
        zones_id: values.selectedZones,
        params_ids: values.selectedParams,
        content: values.annotation,
        start_date: values.date.from || new Date,
        end_date: values.date.to || new Date,
        type: values.type,
        tag: values.tag
      }, {
        onSuccess: () => {
          form.reset()
          setResetDates(true)
          setErrorMsg(null)
          refetchTable()
        },
        onError: () => {
          setResetDates(true)
          setErrorMsg("Error al crear la anotación")
        }
      })
    } else {
      setResetDates(false)
      setErrorMsg("Debes seleccionar un cluster y al menos una zona y un parámetro")
    }
  }

  useEffect(() => {
    // Reset date fields to null after form submission
    if (resetDates) {
      if (startDateInputRef.current) {
        startDateInputRef.current.value = ""
      }
      if (endDateInputRef.current) {
        endDateInputRef.current.value = ""
      }
    }
  }, [form.formState.isSubmitted, resetDates])

  // Show error message for 5 seconds (5000 ms)
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null)
      }, 5000) 
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  return (
    <>
      <div className="flex flex-row">
        <FormField 
          control={form.control}
          name="clusterName"
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={handleClusterChange}>
                <SelectTrigger className="w-auto font-medium mr-5 focus:ring-transparent">
                  <SelectValue placeholder="Elige un cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{org_of_admin?.name}</SelectLabel>
                    {clustersOrgLoading  && <SelectLabel>Cargando...</SelectLabel>}
                    {!clustersOrgLoading && clustersOrg?.find(cluster => cluster.organization === org_of_admin?.name)?.locations_names.map((cluster_name, index) => (
                      <SelectItem key={index} value={cluster_name}>
                        {cluster_name}
                      </SelectItem>
                    ))}
                    {isErrorOrg || clustersOrgError && <SelectLabel>Error al cargar clusters</SelectLabel>}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <ZonesCheckbox
          onZoneChange={handleZonesChange}
          cluster={{ organizationName: org_of_admin ? org_of_admin.name : "Desconocido", name: form.watch("clusterName") }}
          disable={!form.watch("clusterName")}
        />
        <ParamsCheckbox
          onParameterChange={handleParamsChange}
          selectedZones={form.watch("selectedZones")}
          disable={form.watch("selectedZones").length === 0}
        />
      </div>
      <Form {...form}>
        <h1 className="text-lg font-semibold mb-5 mt-5">
          Publicar nueva anotación
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 items-center">
          <FormField
            control={form.control}
            name='date'
            render={({field}) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    id="startDate"
                    className={cn("w-[190px] justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}
                    max={formatDateToISO(new Date())}
                    ref={startDateInputRef}
                    onChange={handleStartDateChange}
                  />
                </FormControl>
                <FormDescription>
                    Selecciona la fecha de inicio de la anotación.
                </FormDescription>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='date'
            render={({field}) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de término</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    id="endDate"
                    className={cn("w-[190px] justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}
                    ref={endDateInputRef}
                    onChange={handleEndDateChange}
                  />
                </FormControl>
                <FormDescription>
                Selecciona la fecha de término de la anotación.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annotation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anotación</FormLabel>
                <FormControl>
                  <Input placeholder="Escribe un mensaje.." {...field} />
                </FormControl>
                <FormDescription>
                Escribe el contentenido de la anotación.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-2">
            <div className="w-3/5 space-x-2">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input list="tagSuggestions" placeholder="Ejemplo: Mantención" {...field} />
                    </FormControl>
                    <datalist id="tagSuggestions">
                      <option value="Mantención (campo)" />
                      <option value="Mantención (lab)" />
                      <option value="Mantención (requiere!)" />
                      <option value="Experimento controlado" />
                      <option value="Experimento natural" />
                      <option value="Evento" />
                      <option value="Pruebas de código" />
                      <option value="Solución estándar" />
                      <option value="Calibración" />
                      <option value="Instalación en terreno" />
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className=" w-2/5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mx-5">¿Es privada?</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-auto mx-5 focus:ring-transparent">
                          <SelectValue placeholder="Elige una opción"  />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Elija una opción</SelectLabel>
                          <SelectItem value="private">Privada</SelectItem>
                          <SelectItem value="public">Pública</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit" className=" self-center">Enviar</Button>
          {errorMsg && <div className="text-red-600 text-sm xs:text-xs mt-2">{errorMsg}</div>}
        </form>
      </Form>
    </>
  )
}

export default AnnotationForm
