// lib/schemas/usuarios.ts
import { z } from "zod"

/** Core común a todos los usuarios */
export const PersonaBaseSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  apellido: z.string().trim().min(1, "El apellido es obligatorio").max(100),
  // Permitimos "" como “no provisto”. Lo normalizás antes de enviar.
  direccion: z.union([z.string().max(200, "Máximo 200"), z.literal("")]).optional(),
  dni: z.string().trim().regex(/^\d{8,12}$/, "El DNI debe tener entre 8 y 12 dígitos numéricos"),
  email: z.string().trim().email("Ingresá un email válido"),
})
export type PersonaBase = z.infer<typeof PersonaBaseSchema>

/** Esquemas por rol */
export const AlumnoSchema = PersonaBaseSchema.extend({
  cuil: z.literal(""),
  obra_social: z.literal(""),
  rol: z.literal("alumno"),
})
export type AlumnoForm = z.infer<typeof AlumnoSchema>

export const DocenteSchema = PersonaBaseSchema.extend({
  cuil: z.string().trim().min(11, "CUIL inválido").max(13),
  obra_social: z.string().trim().min(1, "Obra social obligatoria"),
  rol: z.literal("docente"),
})
export type DocenteForm = z.infer<typeof DocenteSchema>

export const AdministrativoSchema = PersonaBaseSchema.extend({
  cuil: z.string().trim().min(11, "CUIL inválido").max(13),
  obra_social: z.string().trim().min(1, "Obra social obligatoria"),
  rol: z.literal("administrativo"),
})
export type AdministrativoForm = z.infer<typeof AdministrativoSchema>

/** Helper opcional para normalizar dirección "" -> undefined antes de POST */
export function normalizarDireccion<T extends { direccion?: string | "" }>(data: T) {
  const direccion = typeof data.direccion === "string" && data.direccion.trim() === ""
    ? undefined
    : data.direccion?.trim()
  return { ...data, direccion }
}

// al final del archivo (o donde prefieras)
export const UsuarioSchema = z.discriminatedUnion("rol", [
  AlumnoSchema,
  DocenteSchema,
  AdministrativoSchema,
])

export type UsuarioForm = z.infer<typeof UsuarioSchema>

