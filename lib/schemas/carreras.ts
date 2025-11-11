// lib/schemas/carreras.ts
import { z } from "zod"

/* ───────────────────────── Enums ───────────────────────── */

export const NivelAcademicoEnum = z.enum([
  "Tecnicatura",
  "Grado",
  "Posgrado",
  "Doctorado",
])
export type NivelAcademico = z.infer<typeof NivelAcademicoEnum>

export const EstadoCarreraEnum = z.enum(["ACTIVA", "INACTIVA"])
export type EstadoCarrera = z.infer<typeof EstadoCarreraEnum>

/* ────────────────── Reglas y helpers reutilizables ────────────────── */

// Alfanumérico 5–10 (sin espacios). Se normaliza a MAYÚSCULAS.
const codigoSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, "")) // quitamos espacios internos
  .refine((s) => /^[A-Za-z0-9]{5,10}$/.test(s), {
    message: "El código debe ser alfanumérico (5–10 caracteres, sin espacios).",
  })
  .transform((s) => s.toUpperCase())

const nombre150 = z
  .string()
  .trim()
  .min(1, "Campo obligatorio")
  .max(150, "Máximo 150 caracteres")

/* ─────────────────────── Base común ─────────────────────── */

export const CarreraBaseSchema = z.object({
  // Campos editables por UI
  codigo: codigoSchema,                // único (la unicidad se valida en backend)
  nombre: nombre150,
  titulo_otorgado: nombre150,          // ej: "Licenciado en Ciencias de la Computación"
  nivel_academico: NivelAcademicoEnum,
  duracion_estimada: z
    .number()
    .refine((v) => Number.isFinite(v), { message: "Debe ser un número" }) // evita NaN/Infinity
    .refine((v) => Number.isInteger(v), { message: "Debe ser un entero" })
    .min(1, { message: "Mínimo 1 año" }),
  facultad_asociada: nombre150,
  estado: EstadoCarreraEnum,
})

/**
 * Para CREATE: todos obligatorios (salvo que quieras permitir default de estado).
 * Las fechas las gestiona el backend.
 */
export const CarreraCreateSchema = CarreraBaseSchema.extend({
  plan_de_estudio_id: z.number().int().positive(),
});

/**
 * Para UPDATE: permitimos modificar cualquier campo excepto, típicamente, `codigo`
 * (suele ser identificador estable). Si preferís permitir cambiarlo, usá CarreraBaseSchema.
 */
export const CarreraUpdateSchema = CarreraBaseSchema.extend({
  // `codigo` inmutable: lo quitamos del payload editable
  codigo: z.never().optional() as unknown as z.ZodNever, // evita que llegue desde el form
}).strip()

/**
 * Para búsqueda por código (ej: /by-codigo?codigo=XXXX):
 */
export const CarreraCodigoSchema = z.object({
  codigo: codigoSchema,
})

/* ─────────────────────────── Tipos ─────────────────────────── */

export type CarreraBase = z.infer<typeof CarreraBaseSchema>
export type CarreraCreate = z.infer<typeof CarreraCreateSchema>;
export type CarreraUpdate = z.infer<typeof CarreraUpdateSchema>  // sin `codigo`
export type CarreraCodigo = z.infer<typeof CarreraCodigoSchema>

/* ───────── Helper de normalización (trim y strings vacíos → undefined) ───────── */
/** Útil antes de hacer POST/PUT si en algún momento agregás campos opcionales */
export function normalizarCarrera<T extends Record<string, unknown>>(data: T) {
  const out: Record<string, unknown> = { ...data }
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string") {
      const t = v.trim()
      out[k] = t === "" ? undefined : t
    }
  }
  return out as T
}
