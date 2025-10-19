// lib/schemas/materias.ts
import { z } from "zod"

/* ───────────────────────── Enums ───────────────────────── */

export const EstadoMateriaEnum = z.enum(["Activa", "Inactiva"])
export type EstadoMateria = z.infer<typeof EstadoMateriaEnum>

/* ────────────────── Reglas y helpers reutilizables ────────────────── */

// Alfanumérico 5–10 (sin espacios). Se normaliza a MAYÚSCULAS.
const codigoMateriaSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, "")) // quita espacios internos
  .refine((s) => /^[A-Za-z0-9]{5,10}$/.test(s), {
    message: "El código debe ser alfanumérico (5–10 caracteres, sin espacios).",
  })
  .transform((s) => s.toUpperCase())

const nombre150 = z
  .string()
  .trim()
  .min(1, "Campo obligatorio")
  .max(150, "Máximo 150 caracteres")

const descripcion1000 = z
  .string()
  .trim()
  .min(1, "Campo obligatorio")
  .max(1000, "Máximo 1000 caracteres")

/* ─────────────────────── Base común ─────────────────────── */

export const MateriaBaseSchema = z.object({
  codigo: codigoMateriaSchema,         // único (unicidad: backend)
  nombre: nombre150,                   // "Nombre de Materia"
  descripcion: descripcion1000,        // textarea
  creditos: z.number()
    .refine((v) => Number.isFinite(v), { message: "Debe ser un número" })
    .refine((v) => Number.isInteger(v), { message: "Debe ser un entero" })
    .min(1, { message: "Mínimo 1 crédito" })
    .max(20, { message: "Máximo 20 créditos" }),
  carga_horaria_semanal: z.number()
    .refine((v) => Number.isFinite(v), { message: "Debe ser un número" })
    .refine((v) => Number.isInteger(v), { message: "Debe ser un entero" })
    .min(1, { message: "Mínimo 1 hora/semana" })
    .max(20, { message: "Máximo 20 horas/semana" }),
  estado: EstadoMateriaEnum,           // select
})

/** CREATE: todos obligatorios */
export const MateriaCreateSchema = MateriaBaseSchema

/** UPDATE: normalmente no se permite cambiar `codigo` desde UI */
export const MateriaUpdateSchema = MateriaBaseSchema.extend({
  codigo: z.never().optional() as unknown as z.ZodNever,
}).strip()

/** Búsqueda por código */
export const MateriaCodigoSchema = z.object({
  codigo: codigoMateriaSchema,
})

/* ─────────────────────────── Tipos ─────────────────────────── */

export type MateriaBase = z.infer<typeof MateriaBaseSchema>
export type MateriaCreate = z.infer<typeof MateriaCreateSchema>
export type MateriaUpdate = z.infer<typeof MateriaUpdateSchema>   // sin `codigo`
export type MateriaCodigo = z.infer<typeof MateriaCodigoSchema>

/* ───────── Helper de normalización (trim y strings vacíos → undefined) ───────── */
export function normalizarMateria<T extends Record<string, unknown>>(data: T) {
  const out: Record<string, unknown> = { ...data }
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string") {
      const t = v.trim()
      out[k] = t === "" ? undefined : t
    }
  }
  return out as T
}
