// lib/schemas/planes.ts
import { z } from "zod";

export const EstadoPlanEnum = z.enum(["VIGENTE", "BORRADOR", "INACTIVO"]);

export const PlanCreateSchema = z.object({
  codigo: z.string().min(1, "Código obligatorio"),
  nombre: z.string().min(1, "Nombre obligatorio"),
  version: z.string().min(1, "Versión obligatoria"),
  fechaVigencia: z.string().min(1, "Fecha de vigencia obligatoria"),
  estado: EstadoPlanEnum.default("VIGENTE"),

  // UI opcional (se guardará luego en MateriaPlan con otro endpoint)
  materiaId: z.coerce.number().int().optional(),
  correlativaId: z.coerce.number().int().optional(),
  tipoCorrelatividad: z.enum(["APROBADA", "REGULAR", "CURSADA"]).optional(),
});

export type PlanCreate = z.infer<typeof PlanCreateSchema>;

export function normalizarPlan(input: PlanCreate) {
  return {
    codigo: input.codigo.trim(),
    nombre: input.nombre.trim(),
    version: input.version.trim(),
    fechaVigencia: new Date(input.fechaVigencia),
    estado: input.estado,
  };
}
