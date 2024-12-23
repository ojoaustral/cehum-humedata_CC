import { z } from "zod"

export const formSchema = z.object({
  annotation: z.string().max(200, {
    message: "El mensaje tiene un límite de 200 caracteres.",
  }),
  tag: z.string().min(1, {
    message: "La etiqueta no puede ser vacía.",
  }),
  type: z.enum(["public", "private"], { message: "Debe seleccionar un tipo." }),
  date: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }, { required_error: "Se requiere un rango de tiempo." }).refine((date) => {
    return !!date.from
  }),
  clusterName: z.string(),
  selectedZones: z.array(z.string()),
  selectedParams: z.array(z.string()),
  privateOption: z.string(),
})

export type FormSchema = z.infer<typeof formSchema>