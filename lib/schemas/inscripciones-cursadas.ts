// lib/schemas/inscripciones-cursadas.ts
import { z } from "zod"
import { ModalidadInscripcionEnum } from "./inscripciones"

/* Enums para reutilizar en validaciones frontend */
export const EstadoInscripcionCursadaEnum = z.enum(["ACTIVA", "BAJA", "FINALIZADA"])
export const ResultadoFinalEnum = z.enum(["APROBADO", "DESAPROBADO", "PENDIENTE"])

// Schema base para crear una inscripción a cursada
// usuarioId se toma de la sesión; estado/modalidad/resultadoFinal se asignan en backend
export const InscripcionCursadaCreateSchema = z.object({
  cursadaId: z.number().int().positive("Debe seleccionar una cursada"),
})

export type EstadoInscripcionCursada = z.infer<typeof EstadoInscripcionCursadaEnum>
export type ResultadoFinal = z.infer<typeof ResultadoFinalEnum>
export type InscripcionCursadaCreate = z.infer<typeof InscripcionCursadaCreateSchema>

// Admin: crear inscripción a cursada para un alumno
export const InscripcionCursadaCreateAdminSchema = z.object({
  usuarioId: z.number().int().positive("Debe seleccionar un alumno"),
  cursadaId: z.number().int().positive("Debe seleccionar una cursada"),
  modalidad: ModalidadInscripcionEnum.optional(), // backend forzará ADMINISTRATIVO
})

export type InscripcionCursadaCreateAdmin = z.infer<typeof InscripcionCursadaCreateAdminSchema>
