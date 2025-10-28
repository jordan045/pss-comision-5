// lib/schemas/planes.ts
import { z } from "zod";

export const EstadoPlanEnum = z.enum(["VIGENTE", "BORRADOR", "INACTIVO"]);

export const PlanCreateSchema = z.object({
  codigo: z.string().min(1, "Código obligatorio"),
  nombre: z.string().min(1, "Nombre obligatorio"),                  // <- NUEVO
  version: z.string().min(1, "Versión obligatoria"),
  fechaVigencia: z.string().min(1, "Fecha de vigencia obligatoria"),
  estado: EstadoPlanEnum.default("VIGENTE"),
  carreraId: z.coerce.number().int().positive("Carrera obligatoria"),

  // solo UI (no escribir directamente en PlanDeEstudio)
  materiaId: z.coerce.number().int().optional(),
  correlativaId: z.coerce.number().int().optional(),
  tipoCorrelatividad: z.enum(["APROBADA", "REGULAR", "CURSADA"]).optional(),
});

export type PlanCreate = z.infer<typeof PlanCreateSchema>;

export function normalizarPlan(input: PlanCreate) {
  return {
    codigo: input.codigo.trim(),
    version: input.version.trim(),
    fechaVigencia: new Date(input.fechaVigencia), // prisma DateTime
    estado: input.estado,
    carreraId: input.carreraId,
    // lo de materias/correlatividades se guardará en sus tablas específicas
  };
}
