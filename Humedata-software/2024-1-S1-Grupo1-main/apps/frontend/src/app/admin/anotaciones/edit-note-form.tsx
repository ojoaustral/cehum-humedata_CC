import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { formatDateToISO } from "@/hooks/date-to-string-format"
// import ParamsCheckbox from "@/components/admin/parameters/parameters-checkbox"

interface AnnotationGet {
  id: string;
  zoneId: string;
  params_id: string[];
  start_date: Date | null;
  end_date: Date | null;
  content: string | null;
  tag: string | null;
  type: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AnnotationUpdate {
  id: string;
  params_id?: string[];
  content?: string;
  start_date?: Date;
  end_date?: Date;
  type?: "public" | "private";
  tag?: string;
}

interface EditNoteFormProps {
  note: AnnotationGet;
  onSave: (noteUpdate: AnnotationUpdate) => void;
  onCancel: () => void;
}

const editNoteSchema = z.object({
  content: z.string().max(200),
  tag: z.string().min(1),
  type: z.enum(["public", "private"]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  params_id: z.array(z.string()).optional(),
})

type EditNoteFormValues = z.infer<typeof editNoteSchema>

const EditNoteForm: React.FC<EditNoteFormProps> = ({ note, onSave, onCancel }) => {
  const form = useForm<EditNoteFormValues>({
    resolver: zodResolver(editNoteSchema),
    defaultValues: {
      content: note.content || "",
      tag: note.tag || "",
      type: note.type as "public" | "private",
      start_date: note.start_date ? formatDateToISO(new Date(note.start_date)) : undefined,
      end_date: note.end_date ? formatDateToISO(new Date(note.end_date)) : undefined,
      params_id: note.params_id || [],
    },
  })

  const handleSave = (values: EditNoteFormValues) => {
    const parsedValues: AnnotationUpdate = {
      id: note.id,
      ...values,
      start_date: values.start_date ? new Date(values.start_date) : undefined,
      end_date: values.end_date ? new Date(values.end_date) : undefined,
    }
    onSave(parsedValues)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Contenido</label>
        <Input id="content" {...form.register("content")} />
        {form.formState.errors.content && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.content.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-gray-700">Etiqueta</label>
        <Input id="tag" {...form.register("tag")} />
        {form.formState.errors.tag && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.tag.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
        <select id="type" {...form.register("type")} className="block w-full mt-1">
          <option value="public">Pública</option>
          <option value="private">Privada</option>
        </select>
        {form.formState.errors.type && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.type.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
        <Input 
          type="datetime-local"
          id="start_date"
          {...form.register("start_date")}
          max={formatDateToISO(new Date())}
        />
        {form.formState.errors.start_date && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.start_date.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Fecha de término</label>
        <Input 
          type="datetime-local"
          id="end_date"
          {...form.register("end_date")}
          max={formatDateToISO(new Date())}
        />
        {form.formState.errors.end_date && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.end_date.message}</p>
        )}
      </div>
      {/* <div>
        <ParamsCheckbox
          onParameterChange={(params) => form.setValue("params_id", params)}
          selectedZones={[note.zoneId]} // zoneId of note in edition
          disable={false}
        />
      </div> */}
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

export default EditNoteForm