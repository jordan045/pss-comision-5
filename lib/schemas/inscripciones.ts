// lib/schemas/inscripciones.ts
import { z } from "zod"

/* ───────────────────────── Enums ───────────────────────── */

export const EstadoInscripcionEnum = z.enum(["ACTIVA", "INACTIVA"])
export type EstadoInscripcion = z.infer<typeof EstadoInscripcionEnum>

export const ModalidadInscripcionEnum = z.enum([
  "INSCRIPCION_POR_ALUMNO",
  "INSCRIPCION_POR_ADMINISTRATIVO"
])
export type ModalidadInscripcion = z.infer<typeof ModalidadInscripcionEnum>

/* ─────────────────────── Base común ─────────────────────── */

export const InscripcionCarreraBaseSchema = z.object({
  carreraId: z.number().int().positive("Debe seleccionar una carrera"),
  planDeEstudioId: z.number().int().positive("Debe seleccionar un plan de estudio"),
})

/**
 * Para CREATE desde el alumno: solo necesita carrera y plan
 * El usuarioId se toma de la sesión
 * El estado y modalidad se asignan por defecto en el backend
 */
export const InscripcionCarreraCreateSchema = InscripcionCarreraBaseSchema

/**
 * Para CREATE desde administrativo (futuro): podría incluir usuarioId y modalidad
 */
export const InscripcionCarreraCreateAdminSchema = InscripcionCarreraBaseSchema.extend({
  usuarioId: z.number().int().positive(),
  modalidad: ModalidadInscripcionEnum.optional(),
})

/**
 * Schema para buscar alumno por DNI
 */
export const BuscarAlumnoPorDniSchema = z.object({
  dni: z.string().trim().regex(/^\d{8,12}$/, "El DNI debe tener entre 8 y 12 dígitos numéricos"),
})

/* ─────────────────────────── Tipos ─────────────────────────── */

export type InscripcionCarreraBase = z.infer<typeof InscripcionCarreraBaseSchema>
export type InscripcionCarreraCreate = z.infer<typeof InscripcionCarreraCreateSchema>
export type InscripcionCarreraCreateAdmin = z.infer<typeof InscripcionCarreraCreateAdminSchema>
export type BuscarAlumnoPorDni = z.infer<typeof BuscarAlumnoPorDniSchema>
